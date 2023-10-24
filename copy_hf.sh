sudo mkdir /localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ

# Base URL for regular files
base_url="https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-AWQ/blob/main"

sudo curl -o /localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ/.gitattributes -L "$base_url/.gitattributes"
sudo curl -o /localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ/README.md -L "$base_url/README.md"
sudo curl -o /localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ/config.json -L "$base_url/config.json"
sudo curl -o /localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ/generation_config.json -L "$base_url/generation_config.json"
sudo curl -o /localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ/quant_config.json -L "$base_url/quant_config.json"
sudo curl -o /localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ/special_tokens_map.json -L "$base_url/special_tokens_map.json"
sudo curl -o /localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ/tokenizer.json -L "$base_url/tokenizer.json"
sudo curl -o /localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ/tokenizer_config.json -L "$base_url/tokenizer_config.json"

# Direct links for Git LFS files
sudo curl -o /localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ/model.safetensors -L "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-AWQ/resolve/main/model.safetensors"
sudo curl -o /localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ/tokenizer.model -L "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-AWQ/resolve/main/tokenizer.model"
