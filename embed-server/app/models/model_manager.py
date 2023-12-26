import os
import pathlib
from typing import List, Dict, Any, Union

from schemas import EmbeddingOutput

from sentence_transformers import SentenceTransformer


EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME")
MODELS_PATH = os.getenv("MODELS_PATH")
DEVICE = os.getenv("DEVICE")
DEFAULT_SUBFOLDER = ""
AVER_WORD_TOKENS = os.getenv("AVER_WORD_TOKENS")

print(f"*** EMBEDDING_MODEL_NAME: {EMBEDDING_MODEL_NAME}")
print(f"*** MODELS_PATH: {MODELS_PATH}")


class ModelManager:
    def __init__(self):
        """Initialize the Model Manager."""
        model_name = os.getenv("EMBEDDING_MODEL_NAME")
        self.model_name = model_name.split("/")[-1]
        # self.device = DEVICE
        self.device = "cpu"
        self.model = self._load_model()

    def _get_model_path(self) -> pathlib.Path:
        """Determine the model path based on the EMBEDDING_MODEL_NAME."""
        parts = EMBEDDING_MODEL_NAME.split("/")
        app_folder = pathlib.Path(__file__).parent.parent
        # print(f"*** app_folder: {app_folder}")
        dest_folder = app_folder / MODELS_PATH  # app/model-store
        # in a container app/model-store is a volume mounted to localRAG/model-store on host
        subfolder = parts[0] if len(parts) > 1 else DEFAULT_SUBFOLDER
        model_folder = parts[1] if len(parts) > 1 else parts[0]
        return dest_folder / subfolder / model_folder

    def _load_model(self) -> SentenceTransformer:
        """Load or download the Sentence Transformer model."""
        model_path = self._get_model_path()

        if model_path.exists():
            print(f"{EMBEDDING_MODEL_NAME} is found on the local device")
            return SentenceTransformer(str(model_path))

        model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        model.save(path=str(model_path))
        print(f"{EMBEDDING_MODEL_NAME} is downloaded and saved to {model_path}")
        return model

    async def embed_documents(self, text_list: Union[str, List[str]]) -> EmbeddingOutput:
        """Generate embeddings for the provided text list and estimate token usage."""
        text_list = [text_list] if isinstance(text_list, str) else text_list
        embeddings = self.model.encode(text_list, device=self.device)

        # Calculate estimated token usage
        tokens = [len(text.split()) * float(AVER_WORD_TOKENS) for text in text_list]

        return EmbeddingOutput(
            object="list",
            data=[
                {
                    "object": "embedding",
                    "embedding": embedding.tolist(),
                    "index": i,
                    "usage": {"prompt_tokens": tokens[i], "total_tokens": tokens[i]},
                }
                for i, embedding in enumerate(embeddings)
            ],
            model=self.model_name,
            usage={"prompt_tokens": sum(tokens), "total_tokens": sum(tokens)},
        )
