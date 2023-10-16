import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, List, Optional, Union

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field

from models.model_manager import ModelManager
from services.x_auth_token import get_x_token_key

load_dotenv()

PORT = int(os.getenv("PORT", 3004))
HOST = os.getenv("HOST", "0.0.0.0")

app = FastAPI(
    # dependencies=[Depends(get_x_token_key)],
    title="Document Embedding Microservice",
    description="""
    This microservice Creates a list of embedding vectors representing the input document.
            """,
)


class EmbeddingInput(BaseModel):
    model: str = Field(default="all-MiniLM-L6-v2")
    input: Union[str, List[str]] = Field(
        default=["This is an example sentence", "Each sentence is converted"]
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


@app.post("/v1/embeddings", response_model=EmbeddingOutput)
async def get_embeddings_endpoint(text_list: EmbeddingInput = Depends()):
    if embed_model is None:
        raise HTTPException(status_code=500, detail="Model not initialized")

    loop = asyncio.get_running_loop()
    try:
        result = await loop.run_in_executor(
            executor, embed_model.embed_documents, text_list.input
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def run():
    import uvicorn

    uvicorn.run("main:app", host=HOST, port=PORT, reload=False)
