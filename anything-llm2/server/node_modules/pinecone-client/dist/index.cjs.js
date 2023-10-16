"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  PineconeClient: () => PineconeClient
});
module.exports = __toCommonJS(src_exports);

// node_modules/ky/distribution/errors/HTTPError.js
var HTTPError = class extends Error {
  constructor(response, request, options) {
    const code = response.status || response.status === 0 ? response.status : "";
    const title = response.statusText || "";
    const status = `${code} ${title}`.trim();
    const reason = status ? `status code ${status}` : "an unknown error";
    super(`Request failed with ${reason}`);
    Object.defineProperty(this, "response", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "request", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "options", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.name = "HTTPError";
    this.response = response;
    this.request = request;
    this.options = options;
  }
};

// node_modules/ky/distribution/errors/TimeoutError.js
var TimeoutError = class extends Error {
  constructor(request) {
    super("Request timed out");
    Object.defineProperty(this, "request", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.name = "TimeoutError";
    this.request = request;
  }
};

// node_modules/ky/distribution/utils/is.js
var isObject = (value) => value !== null && typeof value === "object";

// node_modules/ky/distribution/utils/merge.js
var validateAndMerge = (...sources) => {
  for (const source of sources) {
    if ((!isObject(source) || Array.isArray(source)) && typeof source !== "undefined") {
      throw new TypeError("The `options` argument must be an object");
    }
  }
  return deepMerge({}, ...sources);
};
var mergeHeaders = (source1 = {}, source2 = {}) => {
  const result = new globalThis.Headers(source1);
  const isHeadersInstance = source2 instanceof globalThis.Headers;
  const source = new globalThis.Headers(source2);
  for (const [key, value] of source.entries()) {
    if (isHeadersInstance && value === "undefined" || value === void 0) {
      result.delete(key);
    } else {
      result.set(key, value);
    }
  }
  return result;
};
var deepMerge = (...sources) => {
  let returnValue = {};
  let headers = {};
  for (const source of sources) {
    if (Array.isArray(source)) {
      if (!Array.isArray(returnValue)) {
        returnValue = [];
      }
      returnValue = [...returnValue, ...source];
    } else if (isObject(source)) {
      for (let [key, value] of Object.entries(source)) {
        if (isObject(value) && key in returnValue) {
          value = deepMerge(returnValue[key], value);
        }
        returnValue = { ...returnValue, [key]: value };
      }
      if (isObject(source.headers)) {
        headers = mergeHeaders(headers, source.headers);
        returnValue.headers = headers;
      }
    }
  }
  return returnValue;
};

// node_modules/ky/distribution/core/constants.js
var supportsRequestStreams = (() => {
  let duplexAccessed = false;
  let hasContentType = false;
  const supportsReadableStream = typeof globalThis.ReadableStream === "function";
  if (supportsReadableStream) {
    hasContentType = new globalThis.Request("https://a.com", {
      body: new globalThis.ReadableStream(),
      method: "POST",
      // @ts-expect-error - Types are outdated.
      get duplex() {
        duplexAccessed = true;
        return "half";
      }
    }).headers.has("Content-Type");
  }
  return duplexAccessed && !hasContentType;
})();
var supportsAbortController = typeof globalThis.AbortController === "function";
var supportsResponseStreams = typeof globalThis.ReadableStream === "function";
var supportsFormData = typeof globalThis.FormData === "function";
var requestMethods = ["get", "post", "put", "patch", "head", "delete"];
var validate = () => void 0;
validate();
var responseTypes = {
  json: "application/json",
  text: "text/*",
  formData: "multipart/form-data",
  arrayBuffer: "*/*",
  blob: "*/*"
};
var maxSafeTimeout = 2147483647;
var stop = Symbol("stop");

// node_modules/ky/distribution/utils/normalize.js
var normalizeRequestMethod = (input) => requestMethods.includes(input) ? input.toUpperCase() : input;
var retryMethods = ["get", "put", "head", "delete", "options", "trace"];
var retryStatusCodes = [408, 413, 429, 500, 502, 503, 504];
var retryAfterStatusCodes = [413, 429, 503];
var defaultRetryOptions = {
  limit: 2,
  methods: retryMethods,
  statusCodes: retryStatusCodes,
  afterStatusCodes: retryAfterStatusCodes,
  maxRetryAfter: Number.POSITIVE_INFINITY,
  backoffLimit: Number.POSITIVE_INFINITY
};
var normalizeRetryOptions = (retry = {}) => {
  if (typeof retry === "number") {
    return {
      ...defaultRetryOptions,
      limit: retry
    };
  }
  if (retry.methods && !Array.isArray(retry.methods)) {
    throw new Error("retry.methods must be an array");
  }
  if (retry.statusCodes && !Array.isArray(retry.statusCodes)) {
    throw new Error("retry.statusCodes must be an array");
  }
  return {
    ...defaultRetryOptions,
    ...retry,
    afterStatusCodes: retryAfterStatusCodes
  };
};

// node_modules/ky/distribution/utils/timeout.js
async function timeout(request, abortController, options) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (abortController) {
        abortController.abort();
      }
      reject(new TimeoutError(request));
    }, options.timeout);
    void options.fetch(request).then(resolve).catch(reject).then(() => {
      clearTimeout(timeoutId);
    });
  });
}

// node_modules/ky/distribution/errors/DOMException.js
var DOMException = globalThis.DOMException ?? Error;
function composeAbortError(signal) {
  return new DOMException((signal == null ? void 0 : signal.reason) ?? "The operation was aborted.");
}

// node_modules/ky/distribution/utils/delay.js
async function delay(ms, { signal }) {
  return new Promise((resolve, reject) => {
    if (signal) {
      if (signal.aborted) {
        reject(composeAbortError(signal));
        return;
      }
      signal.addEventListener("abort", handleAbort, { once: true });
    }
    function handleAbort() {
      reject(composeAbortError(signal));
      clearTimeout(timeoutId);
    }
    const timeoutId = setTimeout(() => {
      signal == null ? void 0 : signal.removeEventListener("abort", handleAbort);
      resolve();
    }, ms);
  });
}

// node_modules/ky/distribution/core/Ky.js
var Ky = class {
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  static create(input, options) {
    const ky2 = new Ky(input, options);
    const fn = async () => {
      if (ky2._options.timeout > maxSafeTimeout) {
        throw new RangeError(`The \`timeout\` option cannot be greater than ${maxSafeTimeout}`);
      }
      await Promise.resolve();
      let response = await ky2._fetch();
      for (const hook of ky2._options.hooks.afterResponse) {
        const modifiedResponse = await hook(ky2.request, ky2._options, ky2._decorateResponse(response.clone()));
        if (modifiedResponse instanceof globalThis.Response) {
          response = modifiedResponse;
        }
      }
      ky2._decorateResponse(response);
      if (!response.ok && ky2._options.throwHttpErrors) {
        let error = new HTTPError(response, ky2.request, ky2._options);
        for (const hook of ky2._options.hooks.beforeError) {
          error = await hook(error);
        }
        throw error;
      }
      if (ky2._options.onDownloadProgress) {
        if (typeof ky2._options.onDownloadProgress !== "function") {
          throw new TypeError("The `onDownloadProgress` option must be a function");
        }
        if (!supportsResponseStreams) {
          throw new Error("Streams are not supported in your environment. `ReadableStream` is missing.");
        }
        return ky2._stream(response.clone(), ky2._options.onDownloadProgress);
      }
      return response;
    };
    const isRetriableMethod = ky2._options.retry.methods.includes(ky2.request.method.toLowerCase());
    const result = isRetriableMethod ? ky2._retry(fn) : fn();
    for (const [type, mimeType] of Object.entries(responseTypes)) {
      result[type] = async () => {
        ky2.request.headers.set("accept", ky2.request.headers.get("accept") || mimeType);
        const awaitedResult = await result;
        const response = awaitedResult.clone();
        if (type === "json") {
          if (response.status === 204) {
            return "";
          }
          const arrayBuffer = await response.clone().arrayBuffer();
          const responseSize = arrayBuffer.byteLength;
          if (responseSize === 0) {
            return "";
          }
          if (options.parseJson) {
            return options.parseJson(await response.text());
          }
        }
        return response[type]();
      };
    }
    return result;
  }
  // eslint-disable-next-line complexity
  constructor(input, options = {}) {
    Object.defineProperty(this, "request", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "abortController", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_retryCount", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "_input", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_options", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this._input = input;
    this._options = {
      // TODO: credentials can be removed when the spec change is implemented in all browsers. Context: https://www.chromestatus.com/feature/4539473312350208
      credentials: this._input.credentials || "same-origin",
      ...options,
      headers: mergeHeaders(this._input.headers, options.headers),
      hooks: deepMerge({
        beforeRequest: [],
        beforeRetry: [],
        beforeError: [],
        afterResponse: []
      }, options.hooks),
      method: normalizeRequestMethod(options.method ?? this._input.method),
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      prefixUrl: String(options.prefixUrl || ""),
      retry: normalizeRetryOptions(options.retry),
      throwHttpErrors: options.throwHttpErrors !== false,
      timeout: typeof options.timeout === "undefined" ? 1e4 : options.timeout,
      fetch: options.fetch ?? globalThis.fetch.bind(globalThis)
    };
    if (typeof this._input !== "string" && !(this._input instanceof URL || this._input instanceof globalThis.Request)) {
      throw new TypeError("`input` must be a string, URL, or Request");
    }
    if (this._options.prefixUrl && typeof this._input === "string") {
      if (this._input.startsWith("/")) {
        throw new Error("`input` must not begin with a slash when using `prefixUrl`");
      }
      if (!this._options.prefixUrl.endsWith("/")) {
        this._options.prefixUrl += "/";
      }
      this._input = this._options.prefixUrl + this._input;
    }
    if (supportsAbortController) {
      this.abortController = new globalThis.AbortController();
      if (this._options.signal) {
        const originalSignal = this._options.signal;
        this._options.signal.addEventListener("abort", () => {
          this.abortController.abort(originalSignal.reason);
        });
      }
      this._options.signal = this.abortController.signal;
    }
    if (supportsRequestStreams) {
      this._options.duplex = "half";
    }
    this.request = new globalThis.Request(this._input, this._options);
    if (this._options.searchParams) {
      const textSearchParams = typeof this._options.searchParams === "string" ? this._options.searchParams.replace(/^\?/, "") : new URLSearchParams(this._options.searchParams).toString();
      const searchParams = "?" + textSearchParams;
      const url = this.request.url.replace(/(?:\?.*?)?(?=#|$)/, searchParams);
      if ((supportsFormData && this._options.body instanceof globalThis.FormData || this._options.body instanceof URLSearchParams) && !(this._options.headers && this._options.headers["content-type"])) {
        this.request.headers.delete("content-type");
      }
      this.request = new globalThis.Request(new globalThis.Request(url, { ...this.request }), this._options);
    }
    if (this._options.json !== void 0) {
      this._options.body = JSON.stringify(this._options.json);
      this.request.headers.set("content-type", this._options.headers.get("content-type") ?? "application/json");
      this.request = new globalThis.Request(this.request, { body: this._options.body });
    }
  }
  _calculateRetryDelay(error) {
    this._retryCount++;
    if (this._retryCount < this._options.retry.limit && !(error instanceof TimeoutError)) {
      if (error instanceof HTTPError) {
        if (!this._options.retry.statusCodes.includes(error.response.status)) {
          return 0;
        }
        const retryAfter = error.response.headers.get("Retry-After");
        if (retryAfter && this._options.retry.afterStatusCodes.includes(error.response.status)) {
          let after = Number(retryAfter);
          if (Number.isNaN(after)) {
            after = Date.parse(retryAfter) - Date.now();
          } else {
            after *= 1e3;
          }
          if (typeof this._options.retry.maxRetryAfter !== "undefined" && after > this._options.retry.maxRetryAfter) {
            return 0;
          }
          return after;
        }
        if (error.response.status === 413) {
          return 0;
        }
      }
      const BACKOFF_FACTOR = 0.3;
      return Math.min(this._options.retry.backoffLimit, BACKOFF_FACTOR * 2 ** (this._retryCount - 1) * 1e3);
    }
    return 0;
  }
  _decorateResponse(response) {
    if (this._options.parseJson) {
      response.json = async () => this._options.parseJson(await response.text());
    }
    return response;
  }
  async _retry(fn) {
    try {
      return await fn();
    } catch (error) {
      const ms = Math.min(this._calculateRetryDelay(error), maxSafeTimeout);
      if (ms !== 0 && this._retryCount > 0) {
        await delay(ms, { signal: this._options.signal });
        for (const hook of this._options.hooks.beforeRetry) {
          const hookResult = await hook({
            request: this.request,
            options: this._options,
            error,
            retryCount: this._retryCount
          });
          if (hookResult === stop) {
            return;
          }
        }
        return this._retry(fn);
      }
      throw error;
    }
  }
  async _fetch() {
    for (const hook of this._options.hooks.beforeRequest) {
      const result = await hook(this.request, this._options);
      if (result instanceof Request) {
        this.request = result;
        break;
      }
      if (result instanceof Response) {
        return result;
      }
    }
    if (this._options.timeout === false) {
      return this._options.fetch(this.request.clone());
    }
    return timeout(this.request.clone(), this.abortController, this._options);
  }
  /* istanbul ignore next */
  _stream(response, onDownloadProgress) {
    const totalBytes = Number(response.headers.get("content-length")) || 0;
    let transferredBytes = 0;
    if (response.status === 204) {
      if (onDownloadProgress) {
        onDownloadProgress({ percent: 1, totalBytes, transferredBytes }, new Uint8Array());
      }
      return new globalThis.Response(null, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }
    return new globalThis.Response(new globalThis.ReadableStream({
      async start(controller) {
        const reader = response.body.getReader();
        if (onDownloadProgress) {
          onDownloadProgress({ percent: 0, transferredBytes: 0, totalBytes }, new Uint8Array());
        }
        async function read() {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          if (onDownloadProgress) {
            transferredBytes += value.byteLength;
            const percent = totalBytes === 0 ? 0 : transferredBytes / totalBytes;
            onDownloadProgress({ percent, transferredBytes, totalBytes }, value);
          }
          controller.enqueue(value);
          await read();
        }
        await read();
      }
    }), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }
};

// node_modules/ky/distribution/index.js
var createInstance = (defaults) => {
  const ky2 = (input, options) => Ky.create(input, validateAndMerge(defaults, options));
  for (const method of requestMethods) {
    ky2[method] = (input, options) => Ky.create(input, validateAndMerge(defaults, options, { method }));
  }
  ky2.create = (newDefaults) => createInstance(validateAndMerge(newDefaults));
  ky2.extend = (newDefaults) => createInstance(validateAndMerge(defaults, newDefaults));
  ky2.stop = stop;
  return ky2;
};
var ky = createInstance();
var distribution_default = ky;

// src/fetch-api.ts
function createApiInstance(opts) {
  return distribution_default.extend({
    prefixUrl: opts.baseUrl,
    timeout: 30 * 1e3,
    headers: {
      "Api-Key": opts.apiKey
    },
    hooks: {
      beforeError: [
        // @ts-ignore
        async (error) => {
          const { response } = error;
          if (response && response.body) {
            try {
              const body = await response.clone().json();
              if (body.message) {
                return new PineconeError(body.message, {
                  code: body.code,
                  details: body.details,
                  status: response.status,
                  cause: error
                });
              }
            } catch (e) {
              console.error("Failed reading HTTPError response body", e);
            }
          }
          return error;
        }
      ]
    }
  });
}
var PineconeError = class extends Error {
  constructor(message, opts) {
    var __super = (...args) => {
      super(...args);
    };
    if (opts.cause) {
      __super(message, { cause: opts.cause });
    } else {
      __super(message);
    }
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.code = opts.code;
    this.status = opts.status;
    if (opts.details) {
      this.details = opts.details;
    }
  }
};

// src/utils.ts
function removeNullValuesFromObject(obj) {
  if (obj === void 0)
    return void 0;
  for (const key in obj) {
    const value = obj[key];
    if (value === null)
      delete obj[key];
    else if (typeof value == "object")
      removeNullValuesFromObject(value);
  }
  return obj;
}
function removeNullValues(obj) {
  if (obj === void 0)
    return void 0;
  const { metadata, filter, setMetadata, ...rest } = obj;
  return {
    filter: removeNullValuesFromObject(filter),
    metadata: removeNullValuesFromObject(metadata),
    setMetadata: removeNullValuesFromObject(setMetadata),
    ...rest
  };
}

// src/pinecone-client.ts
var PineconeClient = class {
  constructor(config) {
    const apiKey = config.apiKey || process.env.PINECONE_API_KEY;
    const baseUrl = config.baseUrl || process.env.PINECONE_BASE_URL;
    if (!apiKey) {
      throw new Error(
        "Missing Pinecone API key. Please provide one in the config or set the PINECONE_API_KEY environment variable."
      );
    }
    if (!baseUrl) {
      throw new Error(
        "Missing Pinecone base URL. Please provide one in the config or set the PINECONE_BASE_URL environment variable."
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.namespace = config.namespace;
    this.api = createApiInstance({
      apiKey: this.apiKey,
      baseUrl: this.baseUrl
    });
  }
  /**
   * The Delete operation deletes vectors, by id, from a single namespace. You
   * can delete items by their id, from a single namespace.
   * @param params.ids The ids of the vectors to delete.
   * @param params.deleteAll Deletes all vectors in the index if true.
   * @param params.filter Metadata filter to apply to the delete.
   * @see https://docs.pinecone.io/reference/delete/
   */
  async delete(params) {
    return this.api.post("vectors/delete", {
      json: {
        namespace: this.namespace,
        ...removeNullValues(params)
      }
    }).json();
  }
  /**
   * The DescribeIndexStats operation returns statistics about the index's
   * contents, including the vector count per namespace, the number of
   * dimensions, and the index fullness.
   * @params params.filter Metadata filter to apply to the describe.
   * @see https://docs.pinecone.io/reference/describe_index_stats_post
   */
  async describeIndexStats(params) {
    return this.api.post("describe_index_stats", {
      json: removeNullValues(params)
    }).json();
  }
  /**
   * The Fetch operation looks up and returns vectors, by ID, from a single
   * namespace. The returned vectors include the vector data and/or metadata.
   * @param params.ids The ids of the vectors to fetch.
   * @see https://docs.pinecone.io/reference/fetch
   */
  async fetch(params) {
    const searchParams = [];
    if (this.namespace)
      searchParams.push(["namespace", this.namespace]);
    params.ids.forEach((id) => searchParams.push(["ids", id]));
    return this.api.get("vectors/fetch", { searchParams }).json();
  }
  /**
   * The Query operation searches a namespace, using a query vector. It
   * retrieves the ids of the most similar items in a namespace, along with
   * their similarity scores.
   * @param params.topK The number of results to return.
   * @param params.minScore Filter out results with a score below this value.
   * @param params.filter Metadata filter to apply to the query.
   * @param params.id The id of the vector in the index to be used as the query vector.
   * @param params.vector A dense vector to be used as the query vector.
   * @param params.sparseVector A sparse vector to be used as the query vector.
   * @param params.hybridAlpha Dense vs sparse weighting. 0.0 is all sparse, 1.0 is all dense.
   * @param params.includeMetadata Whether to include metadata in the results.
   * @param params.includeValues Whether to include vector values in the results.
   * @note One of `vector` or `id` is required.
   * @see https://docs.pinecone.io/reference/query
   */
  async query(params) {
    const { hybridAlpha, minScore, ...restParams } = params;
    if (hybridAlpha != void 0) {
      const { vector, sparseVector } = params;
      if (!vector || !sparseVector) {
        throw new Error(
          `Hybrid queries require vector and sparseVector parameters.`
        );
      }
      const weighted = hybridScoreNorm(vector, sparseVector, hybridAlpha);
      params.vector = weighted.values;
      params.sparseVector = weighted.sparseValues;
    }
    const results = await this.api.post("query", {
      json: {
        namespace: this.namespace,
        ...removeNullValues(restParams)
      }
    }).json();
    if (typeof minScore === "number") {
      results.matches = results.matches.filter((r) => r.score >= minScore);
    }
    return results;
  }
  /**
   * The Update operation updates vector in a namespace. If a value is
   * included, it will overwrite the previous value. If a set_metadata
   * is included, the values of the fields specified in it will be added
   * or overwrite the previous value.
   * @param params.id The id of the vector to update.
   * @param params.values The new dense vector values.
   * @param params.sparseValues The new sparse vector values.
   * @param params.setMetadata Metadata to set for the vector.
   * @see https://docs.pinecone.io/reference/update
   */
  async update(params) {
    return this.api.post("vectors/update", {
      json: {
        namespace: this.namespace,
        ...removeNullValues(params)
      }
    }).json();
  }
  /**
   * The Upsert operation writes vectors into a namespace. If a new value is
   * upserted for an existing vector id, it will overwrite the previous value.
   * @param params.vectors The vectors to upsert.
   * @param params.batchSize The number of vectors to upsert in each batch.
   * @note This will automatically chunk the requests into batches of 1000 vectors.
   * @see https://docs.pinecone.io/reference/upsert
   */
  async upsert(params) {
    const batchSize = params.batchSize || 50;
    for (let i = 0; i < params.vectors.length; i += batchSize) {
      const vectors = params.vectors.slice(i, i + batchSize);
      const vectorsWithoutMetadataNulls = vectors.map(removeNullValues);
      await this.api.post("vectors/upsert", {
        json: {
          namespace: this.namespace,
          vectors: vectorsWithoutMetadataNulls
        }
      }).json();
    }
  }
  /**
   * This operation creates a Pinecone index. You can use it to specify the measure of similarity, the dimension of vectors to be stored in the index, the numbers of shards and replicas to use, and more.
   * @param params.environment The environment to create the index in. Eg: us-east-1-aws or us-west1-gcp
   * @param params.name The name of the index to be created. The maximum length is 45 characters.
   * @param params.dimension The dimensions of the vectors to be inserted in the index
   * @param params.metric The distance metric to be used for similarity search. You can use 'euclidean', 'cosine', or 'dotproduct'.
   * @param params.pods The number of pods for the index to use,including replicas.
   * @param params.replicas The number of replicas. Replicas duplicate your index. They provide higher availability and throughput.
   * @param params.shards The number of shards to be used in the index.
   * @param params.pod_type The type of pod to use. One of s1, p1, or p2 appended with . and one of x1, x2, x4, or x8.
   * @param params.metadata_config Configuration for the behavior of Pinecone's internal metadata index. By default, all metadata is indexed; when metadata_config is present, only specified metadata fields are indexed.
   * @param params.source_collection The name of the collection to create an index from.
   * @see https://docs.pinecone.io/reference/create_index
   */
  async createIndex(params) {
    const { environment, ...rest } = params;
    const indexApi = this.api.extend({
      prefixUrl: `https://controller.${environment}.pinecone.io`
    });
    await indexApi.post("databases", { json: rest });
  }
  /**
   * This operation deletes an existing index.
   * @param params.environment The environment the index is in. Eg: us-east-1-aws or us-west1-gcp
   * @param params.name The name of the index to delete.
   * @see https://docs.pinecone.io/reference/delete_index
   */
  async deleteIndex(params) {
    const { environment, name } = params;
    const indexApi = this.api.extend({
      prefixUrl: `https://controller.${environment}.pinecone.io`
    });
    await indexApi.delete(`databases/${name}`);
  }
};
function hybridScoreNorm(dense, sparse, alpha) {
  if (alpha < 0 || alpha > 1) {
    throw new Error("Alpha must be between 0 and 1");
  }
  const sparseValues = {
    indices: sparse.indices,
    values: sparse.values.map((v) => v * (1 - alpha))
  };
  const values = dense.map((v) => v * alpha);
  return { values, sparseValues };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PineconeClient
});
/*! Bundled license information:

ky/distribution/index.js:
  (*! MIT License © Sindre Sorhus *)
*/
//# sourceMappingURL=index.cjs.js.map
