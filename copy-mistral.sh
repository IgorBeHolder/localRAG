# Constants
# as we are at localRAG already, we can use relative paths:
BASE_DIR="./model-store/mistralai/Mistral-7B-Instruct-v0.1"
BASE_URL="https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1/resolve/main"

# Create the directory
sudo mkdir -p "$BASE_DIR"
sudo chmod 755 "$BASE_DIR"

# Download files and set permissions
declare -a files=(
  ".gitattributes" "README.md" "config.json" 
  "generation_config.json" "pytorch_model-00001-of-00002.bin" 
  "pytorch_model-00002-of-00002.bin" "pytorch_model.bin.index.json"
  "special_tokens_map.json" "tokenizer.json" 
  "tokenizer_config.json" "tokenizer.model" 
)

for file in "${files[@]}"
do
   sudo curl -o "$BASE_DIR/$file" -L "$BASE_URL/$file"
   sudo chmod 644 "$BASE_DIR/$file"
   echo "Downloaded and set permissions for $BASE_DIR/$file"
done
