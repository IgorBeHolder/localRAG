from typing import Dict, Tuple
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


async def check_for_duplicates(document_title, type, page_number):
    return True


async def insert_to_db(
    connection: Connection, document: Dict, embed_model: ModelManager, idx: int
):
    document_title = document.document_title
    type = document.type
    page_number = document.page_number
    doc_path = document.doc_path
    tables = document.tables
    images = document.images
    metadata = document.metadata
    embeddings_list = []

    # Splitting the document into chunks
    document_chunks = split_document(document.text_chunk)
    texts_to_embed = [chunk.page_content for chunk in document_chunks]

    try:
        response = await embed_model.embed_documents(texts_to_embed)
    except Exception as e:
        raise

    document_guid = ""

    # print("*********** metadata", metadata)
    if not await check_for_duplicates(document_title, type, page_number):
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
                document.text_chunk,
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

    embeddings_list.append(
        {
            "object": "embedding",
            "embedding": response["data"][0]["embedding"],
            "index": idx,
            "uuid": str(document_guid),
            "usage": response["usage"],
        }
    )

    return embeddings_list
