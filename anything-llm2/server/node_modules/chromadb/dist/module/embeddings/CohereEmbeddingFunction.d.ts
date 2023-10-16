import { IEmbeddingFunction } from "./IEmbeddingFunction";
export declare class CohereEmbeddingFunction implements IEmbeddingFunction {
    private api_key;
    private model;
    constructor({ cohere_api_key, model }: {
        cohere_api_key: string;
        model?: string;
    });
    generate(texts: string[]): Promise<any>;
}
//# sourceMappingURL=CohereEmbeddingFunction.d.ts.map