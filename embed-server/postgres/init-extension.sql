-- Initialize the pg_embedding extension
CREATE EXTENSION IF NOT EXISTS embedding;

-- Create a table for storing collections
CREATE TABLE IF NOT EXISTS collections (
    collection_id SERIAL PRIMARY KEY,
    collection_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to handle updating the timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;   
END;
$$ language 'plpgsql';

-- Create the table for storing text chunks
CREATE TABLE IF NOT EXISTS text_chunks (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES collections(collection_id),
    text_chunk TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger to update the updated_at column whenever a text_chunk is updated
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON text_chunks
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Create the table for storing embeddings
CREATE TABLE IF NOT EXISTS embeddings (
    id INTEGER PRIMARY KEY REFERENCES text_chunks(id),
    embedding_vector REAL[512] NOT NULL,  -- Array of 512 real numbers for the embedding
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a trigger to update the updated_at column whenever an embedding is updated
CREATE TRIGGER set_embedding_timestamp
BEFORE UPDATE ON embeddings
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();



CREATE INDEX ON embeddings USING hnsw (embedding_vector ann_cos_ops) WITH (dims=512, m=5, efconstruction=5, efsearch=5);

-- https://github.com/neondatabase/pg_embedding#tuning-the-hnsw-algorithm
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