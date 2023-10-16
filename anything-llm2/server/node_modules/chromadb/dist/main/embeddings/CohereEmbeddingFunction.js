"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CohereEmbeddingFunction = void 0;
let CohereAiApi;
class CohereEmbeddingFunction {
    constructor({ cohere_api_key, model }) {
        try {
            // eslint-disable-next-line global-require,import/no-extraneous-dependencies
            CohereAiApi = require("cohere-ai");
            CohereAiApi.init(cohere_api_key);
        }
        catch (_a) {
            throw new Error("Please install the cohere-ai package to use the CohereEmbeddingFunction, `npm install -S cohere-ai`");
        }
        this.api_key = cohere_api_key;
        this.model = model || "large";
    }
    async generate(texts) {
        const response = await CohereAiApi.embed({
            texts: texts,
            model: this.model,
        });
        return response.body.embeddings;
    }
}
exports.CohereEmbeddingFunction = CohereEmbeddingFunction;
//# sourceMappingURL=CohereEmbeddingFunction.js.map