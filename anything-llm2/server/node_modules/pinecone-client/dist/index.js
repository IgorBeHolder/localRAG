// src/fetch-api.ts
import ky from "ky";
function createApiInstance(opts) {
  return ky.extend({
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
  code;
  details;
  status;
  constructor(message, opts) {
    if (opts.cause) {
      super(message, { cause: opts.cause });
    } else {
      super(message);
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
  api;
  apiKey;
  baseUrl;
  namespace;
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
export {
  PineconeClient
};
//# sourceMappingURL=index.js.map
