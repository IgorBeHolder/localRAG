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
    This microservice creates a list of embedding vectors representing the input document.
            """,
)


class EmbeddingInput(BaseModel):
    model: str = Field(default="all-MiniLM-L6-v2")
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
            "It is a smaller version of the MiniLM model.",
            "It was trained to predict the next word in a sentence.",
            "This is called a language modeling task.",
            "The model was trained on 1,000,000,000 words.",
            "The model has 6 layers.",
            "The model has 384 hidden units.",
            "The model has 12 attention heads.",
            "The model has 28,628,736 parameters.",
            "The model has 50,000 word pieces in its vocabulary.",
            "The model was trained for 1,000,000 steps.",
            "The model was trained for 4 epochs.",
            "The model was trained on 8 V100 GPUs.",
            "The model was trained using mixed precision.",
            "The model was trained using the Adam optimizer.",
            "The model was trained using the cosine learning rate schedule.",
            "The model was trained using the cross entropy loss function.",
            "So many details about this model! ))",
            "The purpose is to quantify the time it takes to embed a document.",
            "This is the last sentence.",
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
