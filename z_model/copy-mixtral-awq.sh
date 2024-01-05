# Constants
# as we are at localRAG already, we can use relative paths:
BASE_DIR="../model-store/TheBloke/Mixtral-8x7B-Instruct-v0.1-AWQ"
BASE_URL="https://huggingface.co/TheBloke/Mixtral-8x7B-Instruct-v0.1-AWQ/resolve/main"

# Create the directory
sudo mkdir -p "$BASE_DIR"
sudo chmod 755 "$BASE_DIR"

# Download files and set permissions
declare -a files=(
  ".gitattributes" 
  "README.md" 
  "config.json" 
  "generation_config.json"
  "model-00001-of-00003.safetensors"
  # SHA256: 6251f54496d2946e844b2397b8b1cb45a16ea5327e189bf7ddacb82d24553790
  "model-00002-of-00003.safetensors"
  # SHA256: a1233c8a0c379c11503565e773f0bacc1b8cafa582e22a356c92b61c913eab2f
  "model-00003-of-00003.safetensors"
  # SHA256: 1073cbc34284f6e96916d9369718cb7bcbb174af451a5424535e29fab31eb019
  "model.safetensors.index.json"
  "quant_config.json"
  "special_tokens_map.json"
  "tokenizer.json"
  "tokenizer.model"
  "tokenizer_config.json"
)

for file in "${files[@]}"
do
   sudo curl -o "$BASE_DIR/$file" -L "$BASE_URL/$file"
   sudo chmod 644 "$BASE_DIR/$file"
   echo "Downloaded and set permissions for $BASE_DIR/$file"
done
