-- Load the necessary extensions
CREATE EXTENSION IF NOT EXISTS embedding;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for storing documents
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES documents(id) ON DELETE CASCADE NULL,
    guid UUID DEFAULT gen_random_uuid(),
    document_title TEXT,
    type INTEGER NOT NULL DEFAULT 1,
    text_chunk TEXT NOT NULL,
    page_number INTEGER,
    doc_path TEXT,
    tables TEXT[],
    images TEXT[],     
    metadata JSONB,
    embedding_vector REAL[512],
    summary TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing embeddings
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    embedding_vector REAL[512] NOT NULL
);

-- B-tree index for the parent_id column in the documents table
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents (parent_id);

-- HNSW index for the embedding_vector column in the documents table
CREATE INDEX IF NOT EXISTS documents_embedding_vector_hnsw_idx ON documents USING hnsw (embedding_vector ann_cos_ops) WITH (
    dims=512,
    m=5,
    efconstruction=64,
    efsearch=64
);

-- HNSW index for the embeddings table
CREATE INDEX IF NOT EXISTS embeddings_hnsw_idx ON embeddings USING hnsw (embedding_vector ann_cos_ops) WITH (
    dims=512,
    m=5,
    efconstruction=64,
    efsearch=64
);


-- https://github.com/neondatabase/pg_embedding#tuning-the-hnsw-algorithm  (HNSW)
-- The following options allow you to tune the HNSW algorithm when creating an index:

-- dims: Defines the number of dimensions in your vector data. This is a required parameter.
-- m: Defines the maximum number of links or "edges" created for each node during graph construction. 
--    A higher value increases accuracy (recall) but also increases the size of the index in memory and 
--    index construction time.
-- efconstruction: Influences the trade-off between index quality and construction speed. 
--    A high efconstruction value creates a higher quality graph, enabling more accurate search results, 
--    but a higher value also means that index construction takes longer.
-- efsearch: Influences the trade-off between query accuracy (recall) and speed. A higher efsearch value 
--    increases accuracy at the cost of speed. This value should be equal to or larger than k, which is the 
--    number of nearest neighbors you want your search to return (defined by the LIMIT clause in your SELECT query).
