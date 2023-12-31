const { v1_chat_completions, v1_embeddings_openllm } = require('./web_client');

class OpenAi {
  constructor() {
    const { Configuration, OpenAIApi } = require("openai");
    const config = new Configuration({
      apiKey: process.env.OPEN_AI_KEY,
    });
    const openai = new OpenAIApi(config);
    this.openai = openai;
  }

  isValidChatModel(modelName = "") {
    const validModels = ["3LM", "gpt-4", "gpt-3.5-turbo"];
    return validModels.includes(modelName);
  }

  async isSafe(input = "") {
    const IS_OFFLINE = true; //process.env.OPEN_MODEL_PREF == "3LM";
    if (!IS_OFFLINE) {
      const { flagged = false, categories = {} } = await this.openai
        .createModeration({ input })
        .then((json) => {
          const res = json.data;
          if (!res.hasOwnProperty("results"))
            throw new Error("OpenAI moderation: No results!");
          if (res.results.length === 0)
            throw new Error("OpenAI moderation: No results length!");
          return res.results[0];
        })
        .catch((error) => {
          throw new Error(
            `OpenAI::CreateModeration failed with: ${error.message}`
          );
        });


      if (!flagged) return { safe: true, reasons: [] }; //  OK
      const reasons = Object.keys(categories)
        .map((category) => {
          const value = categories[category];
          if (value === true) {
            return category.replace("/", " or ");
          } else {
            return null;
          }
        })
        .filter((reason) => !!reason);

      return { safe: false, reasons }
    }


    // OFFLINE MODE /////////////////////////////////////////////

    return { safe: true, reasons: [] };
  }





  // used in anything-llm/server/utils/chats/index.js:100 (no RAG  or if the number of embeddings is zero. )
  async sendChat(chatHistory = [], prompt, workspace = {}) {

    const model = process.env.OPEN_MODEL_PREF;
    if (!this.isValidChatModel(model))
      throw new Error(
        `OpenAI chat: ${model} is not valid for chat completion!`
      );

    const IS_OFFLINE = true;
    const messages = [
      {
        role: "system",
        content: workspace.openAiPrompt
      },

      ...chatHistory,
      { role: "user", content: prompt },
    ]; //  chat history with the user's   PROMPT at the END

    let textResponse;
    // if (!IS_OFFLINE) {
    //   try {
    //     const json = await this.openai
    //       .createChatCompletion({
    //         model,
    //         temperature: Number(workspace.openAiTemp),
    //         n: 1, // only one completion/response will be generated
    //         messages: messages,
    //       });

    //     const res = json.data; // the response from online chat completion service (openai)
    //     if (!res.hasOwnProperty("choices"))
    //       throw new Error("OpenAI chat: No results!");
    //     if (res.choices.length === 0)
    //       throw new Error("OpenAI chat: No results length!");
    //     textResponse = res.choices[0].message.content;


    //     return res.choices[0].message.content; // the text COMLETION
    //   }
    //   catch (error) {
    //     console.log(error);
    //     throw new Error(
    //       `OpenAI::createChatCompletion failed with: ${error.message}`
    //     );
    //   }
    // } else {

      textResponse = await v1_chat_completions(messages, Number(workspace.openAiTemp));
    // }

    return textResponse;
  }


  // used in:
  // anything-llm/server/utils/vectorDbProviders/lance/index.js:254  in LanceDB.query()
  // anything-llm/server/utils/vectorDbProviders/lance/index.js:304  in LanceDB.chat()
  async getChatCompletion(messages = [], { temperature  }) {
    const IS_OFFLINE = true;
    const model = process.env.OPEN_MODEL_PREF || "gpt-3.5-turbo";

    // if (!IS_OFFLINE) {
    //   const { data } = await this.openai.createChatCompletion({
    //     model,
    //     messages,
    //     temperature,
    //   });

    //   if (!data.hasOwnProperty("choices")) {
    //     throw new Error("OpenAI chat: No results!");
    //   }

    //   if (data.choices.length === 0) {
    //     throw new Error("OpenAI chat: No results length!");
    //   }

    //   return data.choices[0].message.content;

    // } else {  // OFFLINE MODE /////////////////////////////////////////////
      return await v1_chat_completions(messages, temperature);
    // }
  }




  async embedTextInput(textInput) {
    const result = await this.embedChunks(textInput);
    return result?.[0] || [];
  }

  async embedChunks(textChunks = []) {
    const IS_OFFLINE = true;

    if (IS_OFFLINE) {  // get  from local LLM
      if (typeof textChunks === 'string') {
        textChunks = [textChunks];
      }
      const result = await v1_embeddings_openllm(textChunks);
      return result;
    }

    else {  //  online mode /////////////////////////////////
      const {
        data: { data },
      } = await this.openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: textChunks
      });

      return data.length > 0 &&
        data.every((embd) => embd.hasOwnProperty("embedding"))
        ? data.map((embd) => embd.embedding)
        : null;
    }
  }  // end of embedChunks()
}  // end of class OpenAi


module.exports = {
  OpenAi,
};
