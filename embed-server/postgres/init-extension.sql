-- Load the necessary extensions
CREATE EXTENSION IF NOT EXISTS embedding;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update the modified timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;   
END;
$$ language 'plpgsql';

-- Table for storing collections
CREATE TABLE IF NOT EXISTS collections (
    collection_id SERIAL PRIMARY KEY,
    collection_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for the collections table
CREATE TRIGGER set_collections_timestamp
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Table for storing hierarchical section structure
CREATE TABLE IF NOT EXISTS sections (
    section_id SERIAL PRIMARY KEY,
    section_name TEXT NOT NULL,
    parent_id INTEGER REFERENCES sections(section_id) NULL,
    embedding_vector REAL[512] NULL,  
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for the sections table
CREATE TRIGGER set_sections_timestamp
BEFORE UPDATE ON sections
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Table for storing text chunks
CREATE TABLE IF NOT EXISTS text_chunks (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES collections(collection_id),
    section_id INTEGER REFERENCES sections(section_id),
    guid UUID DEFAULT gen_random_uuid(),
    summary TEXT,
    text_chunk TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for the text_chunks table
CREATE TRIGGER set_text_chunks_timestamp
BEFORE UPDATE ON text_chunks
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Table for storing embeddings
CREATE TABLE IF NOT EXISTS embeddings (
    id INTEGER PRIMARY KEY REFERENCES text_chunks(id),
    embedding_vector REAL[512] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for the embeddings table
CREATE TRIGGER set_embeddings_timestamp
BEFORE UPDATE ON embeddings
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();


-- B-tree index for the parent_id column in the sections table
CREATE INDEX IF NOT EXISTS idx_sections_parent_id ON sections (parent_id);

-- B-tree index for the section_name column in the sections table
CREATE INDEX IF NOT EXISTS idx_sections_section_name ON sections (section_name);

-- HNSW index for the embeddings table
CREATE INDEX IF NOT EXISTS embeddings_hnsw_idx ON embeddings USING hnsw (embedding_vector ann_cos_ops) WITH (
    dims=512,
    m=5,
    efconstruction=64,
    efsearch=64
);

-- HNSW index for the sections table to optimize embedding searches
CREATE INDEX IF NOT EXISTS sections_hnsw_idx ON sections USING hnsw (embedding_vector ann_cos_ops) WITH (
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


-- docker build -t pgembeding .
-- docker-compose -p localrag up --build