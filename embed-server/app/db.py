from typing import Dict, List
from asyncpg import Connection
from models.model_manager import ModelManager
from langchain.text_splitter import RecursiveCharacterTextSplitter
import json


def split_document(document: Dict) -> Dict:
    """Split the document into chunks of text small enough to be embedded.
    chunk_size: is measured: by number of characters.
    chunk_overlap: is measured: by number of characters.
    """
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=256, chunk_overlap=20)
    texts = text_splitter.create_documents([document])
    return texts


async def search_document() -> Dict:
    pass


async def check_for_duplicates(connection: Connection, text_chunk) -> str:
    """
    Check if a document with the same title, type, page number, doc path,
    and text_chunk already exists in the database and return its UUID.

    Returns:
    - UUID of the duplicate document if it exists, None otherwise
    """
    query = """
        SELECT guid FROM documents 
        WHERE 
            text_chunk = $1
        LIMIT 1
    """
    uuid = await connection.fetchval(query, text_chunk)
    return uuid


async def insert_to_db(
    connection: Connection, document: Dict, embed_model: ModelManager
):
    document_title = document.document_title
    type = document.type
    page_number = document.page_number
    doc_path = document.doc_path
    tables = document.tables
    images = document.images
    metadata = document.metadata

    # Splitting the document into smaller text_chunks
    document_chunks = split_document(document.text_chunk)
    texts_to_embed = [chunk.page_content for chunk in document_chunks]
    print(f"*** Number of text_chunks: {len(texts_to_embed)}")

    # Embedding the text_chunks as one batch
    try:
        response = await embed_model.embed_documents(texts_to_embed)
    except Exception as e:
        print(f"*** Exception during embedding: {e}")
        raise e

    document_guid = await check_for_duplicates(connection, document.text_chunk)
    if document_guid is None:
        try:
            # Start transaction
            async with connection.transaction():
                # Insert document details and return id and guid
                inserted_row = await connection.fetchrow(
                    """
                    INSERT INTO documents(document_title, type, text_chunk, page_number, doc_path, tables, images, metadata)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING id, guid
                    """,
                    document_title,
                    type,
                    document.text_chunk,  # the whole document text
                    page_number,
                    doc_path,
                    tables,
                    images,
                    json.dumps(metadata),
                )

                document_id, document_guid = inserted_row["id"], inserted_row["guid"]

                # Insert embeddings
                for embedding_data in response["data"]:
                    await connection.execute(
                        """
                        INSERT INTO embeddings(document_id, embedding_vector)
                        VALUES ($1, $2)
                        """,
                        document_id,
                        embedding_data["embedding"],
                    )
                print(
                    f"*** Text chunk inserted with id: {document_id} and guid: {document_guid}"
                )
        except Exception as e:
            print(f"*** Exception during database transaction: {e}")
            raise e
    else:
        print(f"*** Text chunk already exists with guid: {document_guid}")

    response["uuid"] = str(document_guid)
    return response


async def get_similar_text(
    connection: Connection,
    embed_model: ModelManager,
    text_for_search: str,
    n_top: int,
    search_in_embeddings_only: bool = True,
) -> List[str]:
    # Step 1: Embed the input text
    try:
        embedding = await embed_model.embed_documents([text_for_search])
    except Exception as e:
        print(f"*** Exception during embedding: {e}")
        raise e

    # print(f"*** Embedding: {embedding['data'][0]['embedding']}")
    search_embedding = embedding['data'][0]['embedding']

    if search_in_embeddings_only:
        # Search only in embeddings table
        query = """
            SELECT document_id, embedding_vector <-> $1 AS distance
            FROM embeddings
            ORDER BY distance
            LIMIT $2
        """
        results = await connection.fetch(query, search_embedding, n_top)
        document_ids = [result["document_id"] for result in results]
    else:
        # Search in both embeddings and documents tables
        query_embeddings = """
            SELECT document_id, embedding_vector <-> $1 AS distance
            FROM embeddings
            ORDER BY distance
            LIMIT $2
        """
        query_documents = """
            SELECT id AS document_id, embedding_vector <-> $1 AS distance
            FROM documents
            WHERE NOT is_deleted
            ORDER BY distance
            LIMIT $2
        """
        results_embeddings = await connection.fetch(
            query_embeddings, search_embedding, n_top
        )
        results_documents = await connection.fetch(
            query_documents, search_embedding, n_top
        )

        # Combine and sort the results
        combined_results = sorted(
            results_embeddings + results_documents, key=lambda x: x["distance"]
        )[:n_top]
        document_ids = [result["document_id"] for result in combined_results]

    # Retrieve the corresponding text chunks
    query_text_chunks = """
        SELECT text_chunk
        FROM documents
        WHERE id = ANY($1)
    """
    text_chunks = await connection.fetch(query_text_chunks, document_ids)

    return [chunk["text_chunk"] for chunk in text_chunks]
