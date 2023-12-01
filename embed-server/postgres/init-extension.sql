-- Load the necessary extensions
CREATE EXTENSION IF NOT EXISTS embedding;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for storing documents
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES documents(id) ON DELETE CASCADE NULL,
    guid UUID DEFAULT gen_random_uuid(),
    document_title TEXT,
    -- Document type: 0-folder, 1-document, 2-section, 3-text_chunk, 4-question, 9-home_directory
    type INTEGER NOT NULL DEFAULT 1,
    text_chunk TEXT,
    page_number INTEGER,
    doc_path TEXT,
    tables TEXT[],
    images TEXT[],     
    metadata JSONB,
    embedding_vector REAL[384],
    summary TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing embeddings
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    embedding_vector REAL[384] NOT NULL
);

-- B-tree index for the parent_id column in the documents table
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents (parent_id);

-- HNSW index for the embedding_vector column in the documents table
CREATE INDEX IF NOT EXISTS documents_embedding_vector_hnsw_idx ON documents USING hnsw (embedding_vector ann_cos_ops) WITH (
    dims=384,
    m=8,
    efconstruction=64,
    efsearch=64
);

-- HNSW index for the embeddings table
CREATE INDEX IF NOT EXISTS embeddings_hnsw_idx ON embeddings USING hnsw (embedding_vector ann_cos_ops) WITH (
    dims=384,
    m=8,
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

-- Users
CREATE TYPE user_role AS ENUM ('admin', 'user', 'maintainer');

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (username <> '' AND hashed_password <> '')
);


-- Chats
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    max_chat_history INTEGER,
    system_Prompt TEXT,
    max_tokens INTEGER,
    temperature REAL,
    top_p REAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- lastUpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Workspace Chats
CREATE TABLE IF NOT EXISTS chats_history (
    id SERIAL PRIMARY KEY,
    chats_id INTEGER,
    prompt TEXT,
    response TEXT,
    -- include BOOLEAN DEFAULT true,
    -- user_id INTEGER,
    citation INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- lastUpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chats_id) REFERENCES chats (id) ON DELETE CASCADE
    -- FOREIGN KEY (user_id) REFERENCES users (id)
);


CREATE TABLE IF NOT EXISTS chats_documents (
    link_id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    chats_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    parameter TEXT UNIQUE,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- lastUpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Workspace Users
-- CREATE TABLE IF NOT EXISTS workspace_users (
--     id SERIAL PRIMARY KEY,
--     user_id INTEGER,
--     workspace_id INTEGER,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     -- lastUpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users (id),
--     FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
-- );


-- Workspace Documents
-- CREATE TABLE IF NOT EXISTS workspace_documents (
--     id SERIAL PRIMARY KEY,
--     -- docId TEXT UNIQUE,
--     document_id
--     filename TEXT,
--     docpath TEXT,
--     workspaceId INTEGER,
--     metadata TEXT,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     -- lastUpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (workspaceId) REFERENCES workspaces (id)
-- );


-- Document Vectors
-- CREATE TABLE IF NOT EXISTS document_vectors (
--     id SERIAL PRIMARY KEY,
--     docId TEXT,
--     vectorId TEXT,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     lastUpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );


-- Welcome Messages
-- CREATE TABLE IF NOT EXISTS welcome_messages (
--     id SERIAL PRIMARY KEY,
--     username TEXT,
--     response TEXT,
--     orderIndex INTEGER,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );


-- Invites
-- CREATE TABLE IF NOT EXISTS invites (
--     id SERIAL PRIMARY KEY,
--     code TEXT UNIQUE,
--     status TEXT DEFAULT 'pending',
--     claimedBy INTEGER,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     createdBy INTEGER
--     -- lastUpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );