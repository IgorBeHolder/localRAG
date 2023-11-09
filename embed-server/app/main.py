import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Union

from asyncpg import Connection, create_pool
from db import insert_to_db

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


@asynccontextmanager
async def app_lifespan(app: FastAPI):
    global embed_model
    embed_model = ModelManager()
    app.state.db_pool = await create_pool(DATABASE_URL)
    yield
    await app.state.db_pool.close()


app = FastAPI(
    lifespan=app_lifespan,
    # dependencies=[Depends(get_x_token_key)],
    title="Document Embedding Microservice",
    description="""
    This microservice uses a LLM to solve NLP related problems.
            """,
)


class EmbeddingInput(BaseModel):
    model: str = Field(
        default=EMBEDDING_MODEL_NAME,
        description="Model used to generate the embeddings.",
    )
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
        ],
        description="List of text strings to generate embeddings for.",
    )


class EmbeddingData(BaseModel):
    object: str = Field(example="embedding")
    embedding: List[float]
    index: int


class EmbeddingOutput(BaseModel):
    object: str = Field(default="list", example="list")
    data: List[EmbeddingData] = Field(
        description="List of generated embeddings for the input text."
    )
    model: str = Field(
        default=EMBEDDING_MODEL_NAME,
        description="Model that was used to generate the embeddings.",
    )
    usage: Dict[str, int] = Field(
        default={"prompt_tokens": 0, "total_tokens": 0},
        description="Estimated token usage.",
    )


executor = ThreadPoolExecutor(max_workers=os.cpu_count() // 2)

embed_model: Optional[ModelManager] = None


@app.post(
    "/v1/embeddings",
    response_model=EmbeddingOutput,
)
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


# document processor **************************************************************************************************


class Section(BaseModel):
    section_id: Optional[int] = Field(default=None, description="Section ID")
    parent_section_id: Optional[int] = Field(
        default=None, description="Parent Section ID"
    )
    text: Optional[str] = Field(default=None, description="Section Text")


class DocumentInput(BaseModel):
    document_title: str = Field(default=None, description="Document Title")
    structure: Optional[List[Section]] = Field(
        default=None, description="List representing a document Structure"
    )
    tables: Optional[List[str]] = Field(default=None, description="List of tables")
    images: Optional[List[str]] = Field(default=None, description="List of images")
    page_number: Optional[str] = Field(default=None, description="Page number")
    text: Optional[str] = Field(
        default=None, description="Document Text to be embedded"
    )
    document_path: Optional[str] = Field(default=None, description="Document Path")
    metadata: Dict[str, Union[str, int, float]] = Field(
        default=None, description="Metadata"
    )


class DocumentProcessInput(BaseModel):
    model: str = Field(
        default=EMBEDDING_MODEL_NAME, description="Name of the model to be used"
    )
    input: List[DocumentInput] = Field(
        default=None, description="List of documents to be processed"
    )


class DocumentProcessOutput(BaseModel):
    object: str = Field(default="list")
    data: List[EmbeddingData] = Field(
        default=None, description="List of generated embeddings for the input text."
    )
    model: str = Field(
        default=EMBEDDING_MODEL_NAME,
        description="Model that was used to generate the embeddings.",
    )
    usage: Dict[str, int] = Field(
        default={"prompt_tokens": 0, "total_tokens": 0},
        description="List of estimated token usage.",
    )
    uuid: List[str] = Field(
        default="uuid", description="List of Unique ID for the documents"
    )


@app.post(
    "/text_processor",
    response_model=DocumentProcessOutput,
    description="Process a list of documents, store them in the database and return the embeddings and uuid",
)
async def text_processor(
    data: DocumentProcessInput, connection: Connection = Depends(get_db_connection)
):
    try:
        embedding_data_list = []
        async with connection.transaction():
            usage = {"prompt_tokens": 0, "total_tokens": 0}
            for document in data.input:
                embedding_data = await insert_to_db(connection, document, embed_model)
                usage["prompt_tokens"] += embedding_data["usage"]["prompt_tokens"]
                usage["total_tokens"] += embedding_data["usage"]["total_tokens"]
                embedding_data_list.extend(embedding_data)

        return DocumentProcessOutput(
            data=embedding_data_list, model=data.model, usage=usage
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def run():
    import uvicorn

    uvicorn.run("main:app", host=HOST, port=PORT, reload=False)
