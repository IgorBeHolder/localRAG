from typing import Dict, Tuple
from asyncpg import Connection
from models.model_manager import ModelManager

# Assuming 'embed_model' has a method 'embed_text' that returns the embedding and tokens used
# You'll need to implement the details of how you're inserting into the database.


async def insert_to_db(
    connection: Connection, document: Dict, embed_model: ModelManager
) -> Tuple[Dict, Dict]:
    tokens_usage = {"prompt_tokens": 0, "total_tokens": 0}
    embedding, tokens = await embed_model.embed_documents(document["text"])
    tokens_usage["prompt_tokens"] += tokens["prompt_tokens"]
    tokens_usage["total_tokens"] += tokens["total_tokens"]

    # Start transaction
    async with connection.transaction():
        # Insert collection data into the database
        if document["collection_id"]:
            collection_id = await connection.fetchval(
                """
                INSERT INTO collections(collection_name)
                VALUES ($1)
                RETURNING collection_id
                """,
                document[
                    "document_title"
                ],
            )

        # Insert section and text chunk data into the database
        for section in document["structure"]:
            # Use the model to generate embeddings for the section text
            section_embedding, *_ = await embed_model.embed_documents(section["text"])

            # Assuming sections are related to the document (collection) itself
            section_id = await connection.fetchval(
                """
                INSERT INTO sections(section_name, parent_id, embedding_vector) 
                VALUES ($1, $2, $3) 
                RETURNING section_id
                """,
                section["text"],  # Assuming the section text is the section name
                None,  # Adjust if there's a parent section
                section_embedding,
            )

            # Insert text chunk data into the database
            # Assuming each section corresponds to a text chunk
            await connection.execute(
                """
                INSERT INTO text_chunks(collection_id, section_id, summary, text_chunk) 
                VALUES ($1, $2, $3, $4)
                """,
                collection_id,
                section_id,
                section.get("summary", ""),  # Placeholder for summary if exists
                section["text"],
            )

            # Update tokens usage if necessary
            # tokens_usage['prompt_tokens'] += ...
            # tokens_usage['total_tokens'] += ...

        # Insert embeddings for the entire document if necessary
        await connection.execute(
            """
            INSERT INTO embeddings(id, embedding_vector) 
            VALUES ($1, $2)
            """,
            collection_id,  # Assuming the document's collection ID is used for embeddings
            embedding,
        )

    # Return the result data
    # Construct the embedding_data to return based on the inserted data and embeddings
    embedding_data = {"collection_id": collection_id, "embedding": embedding}

    return embedding_data, tokens_usage
