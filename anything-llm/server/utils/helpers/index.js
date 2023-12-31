function getVectorDbClass() {
  const vectorSelection = process.env.VECTOR_DB || "lancedb";
  switch (vectorSelection) {
    case "pinecone":
      const {Pinecone} = require("../vectorDbProviders/pinecone");
      return Pinecone;
    case "chroma":
      const {Chroma} = require("../vectorDbProviders/chroma");
      return Chroma;
    case "lancedb":
      const {LanceDb} = require("../vectorDbProviders/lance");
      return LanceDb;
    case "weaviate":
      const {Weaviate} = require("../vectorDbProviders/weaviate");
      return Weaviate;
    case "qdrant":
      const {QDrant} = require("../vectorDbProviders/qdrant");
      return QDrant;
    default:
      throw new Error("ENV: No VECTOR_DB value found in environment!");
  }
}

function getLLMProvider() {
  const vectorSelection = process.env.LLM_PROVIDER || "openai";
  switch (vectorSelection) {
    case "openai":
      const {OpenAi} = require("../AiProviders/openAi");
      return new OpenAi();
    case "azure":
      const {AzureOpenAi} = require("../AiProviders/zazureOpenAi");
      return new AzureOpenAi();
    default:
      throw new Error("ENV: No LLM_PROVIDER value found in environment!");
  }
}

function toChunks(arr, size) {
  return Array.from({length: Math.ceil(arr.length / size)}, (_v, i) =>
    arr.slice(i * size, i * size + size)
  );
}

function fixEncoding(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }

  const decoder = new TextDecoder("utf-8");
  return decoder.decode(bytes);
}

function serverLog(...arg) {
  if (process.env.NODE_ENV === "development") {
    if (arg.length) {
      arg.forEach(a => {
        console.log(a);
      });
    }
  }
}

module.exports = {
  getVectorDbClass,
  getLLMProvider,
  serverLog,
  toChunks,
  fixEncoding
};
