import os
import pathlib
from typing import List, Dict, Any, Union

from sentence_transformers import SentenceTransformer


EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME")
MODELS_PATH = os.getenv("MODELS_PATH")
DEVICE = os.getenv("DEVICE")
DEFAULT_SUBFOLDER = ""

print(f"*** EMBEDDING_MODEL_NAME: {EMBEDDING_MODEL_NAME}")
print(f"*** MODELS_PATH: {MODELS_PATH}")

class ModelManager:
    def __init__(self):
        """Initialize the Model Manager."""
        self.model_name = EMBEDDING_MODEL_NAME.split("/")[-1]
        self.device = DEVICE
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


    def embed_documents(self, text_list: Union[str, List[str]]) -> Dict[str, Any]:
        """Generate embeddings for the provided text list and estimate token usage."""
        text_list = [text_list] if isinstance(text_list, str) else text_list
        embeddings = self.model.encode(text_list)

        # Calculate estimated token usage
        prompt_tokens = sum(len(text.split()) * 3 for text in text_list)

        return {
            "object": "list",
            "data": [
                {"object": "embedding", "embedding": embedding.tolist(), "index": i}
                for i, embedding in enumerate(embeddings)
            ],
            "model": self.model_name,
            "usage": {
                "prompt_tokens": prompt_tokens,
                "total_tokens": prompt_tokens
            },
        }
