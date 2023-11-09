import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Union

from asyncpg import Connection, create_pool
from db import insert_to_db
# from dotenv import load_doten
from fastapi import Depends, FastAPI, HTTPException, Request
from models.model_manager import ModelManager
from pydantic import BaseModel, Field
# from services.x_auth_token import get_x_token_key


PORT = int(os.getenv("PORT", 3004))
HOST = os.getenv("HOST", "0.0.0.0")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME")
DATABASE_URL = os.getenv("DATABASE_URL")


@asynccontextmanager
async def get_db_connection(request: Request):
    async with request.app.state.db_pool.acquire() as connection:
        yield connection


app = FastAPI(
    # dependencies=[Depends(get_x_token_key)],
    title="Document Embedding Microservice",
    description="""
    This microservice creates a list of embedding vectors representing the input document.
            """,
)


class EmbeddingInput(BaseModel):
    model: str = Field(default=EMBEDDING_MODEL_NAME)
    input: Union[str, List[str]] = Field(
        default=[
            "This is an example sentence",
            "Each sentence is converted",
            "to a vector",
            "using the model",
            "and then returned as a list of vectors.",
            "Here is another sentence.",
            "How many sentences can this model embed at once?",
            "This model can embed up to 256 tokens at once.",
            "The average sentence is about 15 tokens long.",
            "So you can embed about 17 sentences at once.",
            "But you can also embed just one sentence at a time.",
            "This is useful if you want to embed a single sentence.",
            "Or if you want to embed a sentence that is longer than 256 tokens.",
            "This model was trained on the English Wikipedia.",
        ]
    )


class EmbeddingData(BaseModel):
    object: str = Field(example="embedding")
    embedding: List[float]
    index: int


class EmbeddingOutput(BaseModel):
    object: str = Field(default="list", example="list")
    data: List[EmbeddingData]
    model: str
    usage: Dict[str, int] = Field(default={"prompt_tokens": 0, "total_tokens": 0})


executor = ThreadPoolExecutor(max_workers=os.cpu_count() // 2)

embed_model: Optional[ModelManager] = None


@app.on_event("startup")
async def load_model_at_startup():
    global embed_model
    embed_model = ModelManager()
    app.state.db_pool = await create_pool(DATABASE_URL)


# @app.on_event("shutdown")
# async def shutdown():
#     await app.state.db_pool.close()


@app.post("/v1/embeddings", response_model=EmbeddingOutput)
async def get_embeddings_endpoint(data: EmbeddingInput):
    if embed_model is None:
        raise HTTPException(status_code=500, detail="Model not initialized")

    loop = asyncio.get_running_loop()
    try:
        result = await loop.run_in_executor(
            executor, embed_model.embed_documents, data.input
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ********** Document Processing **********
# {
#   "model": "some-model-name",
#   "input": [
#     {
#       "document_title": "Title 1",
#       "structure": [
#         {
#           "section_id": 1,
#           "parent_section_id": null,
#           "text": "Section text"
#         }
#         // ... more sections if needed
#       ],
#       "page_number": 1,
#       "text": "Some text here",
#       "document_path": "/path/to/document",
#       "metadata": {
#         "key1": "value1",
#         "key2": 2
#         // ... more metadata
#       }
#     }
#     // ... more documents if needed
#   ]
# }


class Section(BaseModel):
    section_id: Optional[int]
    parent_section_id: Optional[int]
    text: str


class DocumentInput(BaseModel):
    document_title: str
    structure: List[Section]
    page_number: int
    text: str
    document_path: str
    metadata: Dict[str, Union[str, int, float]]


class DocumentProcessInput(BaseModel):
    model: str = Field(default=EMBEDDING_MODEL_NAME)  # embed_model.model_name
    input: List[DocumentInput]


class DocumentProcessOutput(BaseModel):
    object: str = Field(default="list", example="list")
    data: List[EmbeddingData]
    model: str
    usage: Dict[str, int] = Field(default={"prompt_tokens": 0, "total_tokens": 0})


@app.post("/text_processor", response_model=DocumentProcessOutput)
async def text_processor(
    data: DocumentProcessInput, connection: Connection = Depends(get_db_connection)
):
    try:
        embedding_data_results = []
        async with connection.transaction():
            usage = {"prompt_tokens": 0, "total_tokens": 0}
            for document in data.input:
                embedding_data = await insert_to_db(connection, document, embed_model)
                usage["prompt_tokens"] += embedding_data["usage"]["prompt_tokens"]
                usage["total_tokens"] += embedding_data["usage"]["total_tokens"]
                embedding_data_results.extend(embedding_data)

        return DocumentProcessOutput(
            data=embedding_data_results, model=data.model, usage=usage
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def run():
    import uvicorn

    uvicorn.run("main:app", host=HOST, port=PORT, reload=False)
