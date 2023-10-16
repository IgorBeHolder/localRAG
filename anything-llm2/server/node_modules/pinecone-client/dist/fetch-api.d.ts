/**
 * Create an instance of Ky with options shared by all requests.
 */
export declare function createApiInstance(opts: {
    apiKey: string;
    baseUrl: string;
}): import("ky/distribution/types/ky").KyInstance;
type PineconeErrorDetail = {
    typeUrl: string;
    value: string;
};
export declare class PineconeError extends Error {
    code: number;
    details?: PineconeErrorDetail[];
    status: number;
    constructor(message: string, opts: {
        cause?: Error;
        code: number;
        details?: PineconeErrorDetail[];
        status: number;
    });
}
export {};
//# sourceMappingURL=fetch-api.d.ts.map