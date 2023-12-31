const lancedb = require("vectordb");
const { toChunks, getLLMProvider } = require("../../helpers");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { storeVectorResult, cachedVectorInformation } = require("../../files");
const { v4: uuidv4 } = require("uuid");
// const { chatPrompt } = require("../../chats");

const LanceDb = {
  uri: `${!!process.env.STORAGE_DIR ? `${process.env.STORAGE_DIR}/` : "./storage/"
    }lancedb`,
  name: "LanceDb",
  connect: async function () {
    if (process.env.VECTOR_DB !== "lancedb")
      throw new Error("LanceDB::Invalid ENV settings");

    const client = await lancedb.connect(this.uri);
    return { client };
  },
  heartbeat: async function () {
    await this.connect();
    return { heartbeat: Number(new Date()) };
  },
  tables: async function () {
    const fs = require("fs");
    const { client } = await this.connect();
    const dirs = fs.readdirSync(client.uri);
    return dirs.map((folder) => folder.replace(".lance", ""));
  },
  totalVectors: async function () {
    const { client } = await this.connect();
    const tables = await this.tables();
    let count = 0;
    for (const tableName of tables) {
      const table = await client.openTable(tableName);
      count += await table.countRows();
    }
    return count;
  },
  namespaceCount: async function (_namespace = null) {
    const { client } = await this.connect();
    const exists = await this.namespaceExists(client, _namespace);
    if (!exists) return 0;

    const table = await client.openTable(_namespace);
    return (await table.countRows()) || 0;
  },
  embedder: function () {
    return new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY });
  },
  similarityResponse: async function (client, namespace, queryVector) {
    const collection = await client.openTable(namespace);
    const result = {
      contextTexts: [],
      sourceDocuments: [],
    };

    const response = await collection
      .search(queryVector)
      .metricType("cosine")
      .limit(5) // limit the number of results returned. Was 5
      .execute();

    response.forEach((item) => {
      const { vector: _, ...rest } = item;
      result.contextTexts.push(rest.text);
      result.sourceDocuments.push(rest);
    });

    return result;
  },
  namespace: async function (client, namespace = null) {
    if (!namespace) throw new Error("No namespace value provided.");
    const collection = await client.openTable(namespace).catch(() => false);
    if (!collection) return null;

    return {
      ...collection,
    };
  },
  updateOrCreateCollection: async function (client, data = [], namespace) {
    const hasNamespace = await this.hasNamespace(namespace);
    if (hasNamespace) {
      const collection = await client.openTable(namespace);
      await collection.add(data);
      return true;
    }

    await client.createTable(namespace, data);
    return true;
  },
  hasNamespace: async function (namespace = null) {
    if (!namespace) return false;
    const { client } = await this.connect();
    const exists = await this.namespaceExists(client, namespace);
    return exists;
  },
  namespaceExists: async function (_client, namespace = null) {
    if (!namespace) throw new Error("No namespace value provided.");
    const collections = await this.tables();
    return collections.includes(namespace);
  },
  deleteVectorsInNamespace: async function (client, namespace = null) {
    const fs = require("fs");
    fs.rm(`${client.uri}/${namespace}.lance`, { recursive: true }, () => null);
    return true;
  },
  deleteDocumentFromNamespace: async function (namespace, docId) {
    const { client } = await this.connect();
    const exists = await this.namespaceExists(client, namespace);
    if (!exists) {
      console.error(
        `LanceDB:deleteDocumentFromNamespace - namespace ${namespace} does not exist.`
      );
      return;
    }

    const { DocumentVectors } = require("../../../models/vectors");
    const table = await client.openTable(namespace);
    const vectorIds = (await DocumentVectors.where({ docId })).map(
      (record) => record.vectorId
    );

    if (vectorIds.length === 0) return;
    await table.delete(`id IN (${vectorIds.map((v) => `'${v}'`).join(",")})`);
    return true;
  },
  addDocumentToNamespace: async function (
    namespace,
    documentData = {},
    fullFilePath = null
  ) {
    const { DocumentVectors } = require("../../../models/vectors");
    try {
      const { pageContent, docId, ...metadata } = documentData;
      if (!pageContent || pageContent.length == 0) return false;

      console.log("Adding new vectorized document into namespace", namespace);
      const cacheResult = await cachedVectorInformation(fullFilePath);
      if (cacheResult.exists) {     // If the cached information exists
        const { client } = await this.connect();
        const { chunks } = cacheResult;
        const documentVectors = [];
        const submissions = [];

        for (const chunk of chunks) {
          chunk.forEach((chunk) => {  // loops through each chunk of the cached information
            const id = uuidv4();
            const { id: _id, ...metadata } = chunk.metadata;
            documentVectors.push({ docId, vectorId: id }); // pushes a new object into the documentVectors array
            submissions.push({ id: id, vector: chunk.values, ...metadata });
          });
        }

        await this.updateOrCreateCollection(client, submissions, namespace); //update a database with the information stored in the submissions array
        await DocumentVectors.bulkInsert(documentVectors); // and insert the information stored in the documentVectors array into a separate table.
        return true;
      }

      // If we are here then we are going to embed and store a novel document.
      // We have to do this manually as opposed to using LangChains `xyz.fromDocuments`
      // because we then cannot atomically control our namespace to granularly find/remove documents
      // from vectordb.
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500, // reduce from 1000 (embed-server has max_seq_length of 256 tokens)
        chunkOverlap: 300,
        separators: ["\n\n", "\n"],
        keep_separator: false
      });
      const textChunks = await textSplitter.splitText(pageContent);

      console.log("Chunks created from document:", textChunks.length);
      const LLMConnector = getLLMProvider();
      const documentVectors = [];
      const vectors = [];
      const submissions = [];
      // const vectorValues = await LLMConnector.embedChunks(textChunks);
      const textChunksLowercase = textChunks.map(chunk => chunk.toLowerCase());
      const vectorValues = await LLMConnector.embedChunks(textChunksLowercase);


      if (!!vectorValues && vectorValues.length > 0) {  // If the vectorValues array is not empty
        for (const [i, vector] of vectorValues.entries()) {
          const vectorRecord = {
            id: uuidv4(),
            values: vector,
            // [DO NOT REMOVE]
            // LangChain will be unable to find your text if you embed manually and dont include the `text` key.
            // https://github.com/hwchase17/langchainjs/blob/2def486af734c0ca87285a48f1a04c057ab74bdf/langchain/src/vectorstores/pinecone.ts#L64
            metadata: { ...metadata, text: textChunks[i] },
          };

          vectors.push(vectorRecord);
          submissions.push({
            id: vectorRecord.id,
            vector: vectorRecord.values,
            ...vectorRecord.metadata,
          });
          documentVectors.push({ docId, vectorId: vectorRecord.id });
        }
      } else {
        console.error(
          "Could not use OpenAI to embed document chunks! This document will not be recorded."
        );
      }

      if (vectors.length > 0) { // If the vectors array is not empty
        const chunks = [];
        for (const chunk of toChunks(vectors, 500)) chunks.push(chunk);

        console.log("Inserting vectorized chunks into LanceDB collection.");
        const { client } = await this.connect();
        await this.updateOrCreateCollection(client, submissions, namespace);
        await storeVectorResult(chunks, fullFilePath);
      }

      await DocumentVectors.bulkInsert(documentVectors);
      return true;
    } catch (e) {
      console.error(e);
      console.error("addDocumentToNamespace", e.message);
      return false;
    }
  },
  query: async function (reqBody = {}) {
    const { namespace = null, input, workspace = {} } = reqBody;

    if (!namespace || !input) throw new Error("Invalid request body");

    const { client } = await this.connect();
    if (!(await this.namespaceExists(client, namespace))) {
      return {
        response: null,
        sources: [],
        message: "Invalid query - no documents found for workspace!",
      };
    }

    const LLMConnector = getLLMProvider();
    // const queryVector = await LLMConnector.embedTextInput(input);
    const queryVector = await LLMConnector.embedTextInput(input.toLowerCase()); // the vector representation of the input text.
    const { contextTexts, sourceDocuments } = await this.similarityResponse(
      // retrieves similar documents from a database based on the vector representation of the input text.
      client,
      namespace,
      queryVector
    );

    // FORMING THE MEMORY LIST FOR THE QUERY
    // const { BOS, EOS, assistance_prefix, end_of_turn, user_prefix  } = prompt_templates();

    const context = {
      role: "assistant",
      content:
        `КОНТЕКСТ: \n\n
    ${contextTexts
          .map((text, i) => {
            return `${i}\n${text}\n\n`;
          })
          .join("")}`,
    };

    const memory_list = [
      { role: "system", content: workspace.openAiPrompt + '\nОтвечайте только на основании фактов из КОНТЕКСТа. Если в КОНТЕКСТе нет ответа, то ответьте "не знаю".' },
      context,
      {
        role: "user",
        content: '\nОтвечайте только на основании фактов из КОНТЕКСТа. Если в КОНТЕКСТе нет ответа, то ответьте "не знаю".\n Вопрос:' + input
      }];
    // console.log('LanceDb:QUERY memory:272', memory_list);
    const responseText = await LLMConnector.getChatCompletion(memory_list, {
      temperature: workspace?.openAiTemp ?? 0.21,
    });
    return {
      response: responseText,
      sources: this.curateSources(sourceDocuments),
      message: false,
    };
  },
  // This implementation of chat uses the chat history and modifies the system prompt at execution
  // this is improved over the regular langchain implementation so that chats do not directly modify embeddings
  // because then multi-user support will have all conversations mutating the base vector collection to which then
  // the only solution is replicating entire vector databases per user - which will very quickly consume space on VectorDbs
  chat: async function (reqBody = {}) {
    const {
      namespace = null,
      input,
      workspace = {},
      chatHistory = [],
    } = reqBody;
    if (!namespace || !input) throw new Error("Invalid request body");

    const { client } = await this.connect();
    if (!(await this.namespaceExists(client, namespace))) {
      return {
        response: null,
        sources: [],
        message: "Invalid query - no documents found for workspace!",
      };
    }

    const LLMConnector = getLLMProvider();
    // const queryVector = await LLMConnector.embedTextInput(input); 
    const queryVector = await LLMConnector.embedTextInput(input.toLowerCase()); // address the issue of the chat not working with uppercase letters 'sentence-transformers/all-distilroberta-v1'
    const { contextTexts, sourceDocuments } = await this.similarityResponse(
      client,
      namespace,
      queryVector
    );
    // FORMING THE MEMORY LIST (chat mode)
    // const { BOS, EOS, assistance_prefix, end_of_turn, user_prefix } = prompt_templates();
    const sys_prompt = {
      role: "system",
      // content: BOS + workspace.openAiPrompt
      content: workspace.openAiPrompt + '\nОтвечайте только на основании фактов из КОНТЕКСТа. Если в КОНТЕКСТе нет ответа, то ответьте "не знаю".' };
    const prompt = {
      role: "assistant",
      content:
        `КОНТЕКСТ: \n\n
    ${contextTexts
          .map((text, i) => {
            return `${i}\n${text}\n\n`;
          })
          .join("")}`,
    };
    const memory = [
      sys_prompt,
      prompt,
      ...chatHistory, // the chat history is added to the memory list
      {
        role: "user",

        content: input
      }];
    console.log('LanceDb:CHAT (from vectorized) memory:337', memory);
    const responseText = await LLMConnector.getChatCompletion(memory, {
      temperature: workspace?.openAiTemp ?? 0.23,
    });

    return {
      response: responseText,
      sources: this.curateSources(sourceDocuments),
      message: false,
    };
  },
  "namespace-stats": async function (reqBody = {}) {
    const { namespace = null } = reqBody;
    if (!namespace) throw new Error("namespace required");
    const { client } = await this.connect();
    if (!(await this.namespaceExists(client, namespace)))
      throw new Error("Namespace by that name does not exist.");
    const stats = await this.namespace(client, namespace);
    return stats
      ? stats
      : { message: "No stats were able to be fetched from DB for namespace" };
  },
  "delete-namespace": async function (reqBody = {}) {
    const { namespace = null } = reqBody;
    const { client } = await this.connect();
    if (!(await this.namespaceExists(client, namespace)))
      throw new Error("Namespace by that name does not exist.");

    await this.deleteVectorsInNamespace(client, namespace);
    return {
      message: `Namespace ${namespace} was deleted.`,
    };
  },
  reset: async function () {
    const { client } = await this.connect();
    const fs = require("fs");
    fs.rm(`${client.uri}`, { recursive: true }, () => null);
    return { reset: true };
  },
  curateSources: function (sources = []) {
    const documents = [];
    for (const source of sources) {
      const { text, vector: _v, score: _s, ...metadata } = source;
      if (Object.keys(metadata).length > 0) {
        documents.push({ ...metadata, text });
      }
    }

    return documents;
  },
};


function prompt_templates() {
  const model_name_is_openchat = global.COMPLETION_MODEL_NAME ? global.COMPLETION_MODEL_NAME.includes('openchat') : false;
  const model_name_is_mistral = global.COMPLETION_MODEL_NAME ? global.COMPLETION_MODEL_NAME.includes('tral') : false;

  const user_prefix = model_name_is_openchat
    ? 'GPT4 Correct User: '
    : model_name_is_mistral
      ? '[INST]'
      : '';
  const assistance_prefix = model_name_is_openchat
    ? 'GPT4 Correct Assistant: '
    : model_name_is_mistral
      ? '[INST]'
      : '';
  const end_of_turn = model_name_is_openchat
    ? '<|end_of_turn|>'
    : model_name_is_mistral
      ? '[/INST]'
      : '';

  const BOS = model_name_is_mistral
    ? '<s>'
    : '';
  const EOS = model_name_is_mistral
    ? '</s>'
    : '';

  return { BOS, EOS, assistance_prefix, end_of_turn, user_prefix };
}

module.exports.LanceDb = LanceDb;
module.exports.prompt_templates = prompt_templates;
