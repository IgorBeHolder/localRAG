from typing import Dict, Tuple
from asyncpg import Connection
from models.model_manager import ModelManager
from langchain.text_splitter import RecursiveCharacterTextSplitter


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
    connection: Connection, document: Dict, embed_model: ModelManager
):
    document_title = document.document_title
    type = document.type
    page_number = document.page_number
    doc_path = document.doc_path
    tables = document.tables
    images = document.images
    metadata = document.metadata
    embedding_list = []
    usage = {"prompt_tokens": 0, "total_tokens": 0}
    # embedding_data={"object": "embedding", "embedding": [], "index": 0}

    # ToDo: implement the document splitting logic
    document_for_splitting = document.text_chunk
    document_chunks = split_document(document_for_splitting)
    for ids, document_chunk in enumerate(document_chunks):
        # print(f'************{document_chunk.page_content}')
        response = embed_model.embed_documents(document_chunk.page_content)
        embeddings = response["data"][0]["embedding"]
        embedding_data = {
            "object": "embedding",  # assuming 'object' is a required field
            "embedding": embeddings,
            "index": ids,  # if 'index' is required, provide the value
            # include other necessary fields of EmbeddingData here
        }
        embedding_list.append(embedding_data)
        # embedding_data["index"].append(ids)
        # print(f"************{embedding_data}")
        tokens_usage = response["usage"]
        tokens_usage["prompt_tokens"] += response["usage"]["prompt_tokens"]
        tokens_usage["total_tokens"] += response["usage"]["total_tokens"]
        # print(f'************{uuids}')
    # if not await check_for_duplicates():
    #     # Start transaction
    #     async with connection.transaction():
    #         await connection.execute(
    #             """
    #                 INSERT INTO documents(text_chunk, type, page_number, doc_path, tables, images, metadata, embedding_vector)
    #                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    #                 """,
    #             document_title,
    #             type,
    #             page_number,
    #             doc_path,
    #             tables,
    #             images,
    #             metadata,
    #             embedding_vector,
    #         )

    # Insert embeddings for the entire document if necessary
    # await connection.execute(
    #     """
    #     INSERT INTO embeddings(id, embedding_vector)
    #     VALUES ($1, $2)
    #     """,
    #     collection_id,  # Assuming the document's collection ID is used for embeddings
    #     embedding,
    # )

    # Return the result data
    # Construct the embedding_data to return based on the inserted data and embeddings

    return embedding_list, tokens_usage, "my_uuids"
