# Constants
# as we are at localRAG already, we can use relative paths:
BASE_DIR="./model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ"
BASE_URL="https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-AWQ/resolve/main"

# Create the directory
sudo mkdir -p "$BASE_DIR"

# Download files
declare -a files=(
  ".gitattributes" "README.md" "config.json" 
  "generation_config.json" "quant_config.json" 
  "special_tokens_map.json" "tokenizer.json" 
  "tokenizer_config.json" "model.safetensors" 
  "tokenizer.model"
)

for file in "${files[@]}"
do
   if [ ! -f "$BASE_DIR/$file" ]; then
      sudo curl -o "$BASE_DIR/$file" -L "$BASE_URL/$file"
   else
      echo "File $BASE_DIR/$file already exists. Skipping download."
   fi
done
