import { IEmbeddingFunction } from "./IEmbeddingFunction";
export declare class TransformersEmbeddingFunction implements IEmbeddingFunction {
    private pipelinePromise;
    /**
     * TransformersEmbeddingFunction constructor.
     * @param options The configuration options.
     * @param options.model The model to use to calculate embeddings. Defaults to 'Xenova/all-MiniLM-L6-v2', which is an ONNX port of `sentence-transformers/all-MiniLM-L6-v2`.
     * @param options.revision The specific model version to use (can be a branch, tag name, or commit id). Defaults to 'main'.
     * @param options.quantized Whether to load the 8-bit quantized version of the model. Defaults to `false`.
     * @param options.progress_callback If specified, this function will be called during model construction, to provide the user with progress updates.
     */
    constructor({ model, revision, quantized, progress_callback, }?: {
        model?: string;
        revision?: string;
        quantized?: boolean;
        progress_callback?: Function | null;
    });
    generate(texts: string[]): Promise<number[][]>;
}
//# sourceMappingURL=TransformersEmbeddingFunction.d.ts.map