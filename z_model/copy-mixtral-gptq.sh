# Constants
# as we are at localRAG already, we can use relative paths:
BASE_DIR="../model-store/TheBloke/Mixtral-8x7B-Instruct-v0.1-GPTQ"
BASE_URL="https://huggingface.co/TheBloke/Mixtral-8x7B-Instruct-v0.1-GPTQ/resolve/main"

# Create the directory
sudo mkdir -p "$BASE_DIR"
sudo chmod 755 "$BASE_DIR"

# Download files and set permissions
declare -a files=(
  ".gitattributes" 
  "README.md" 
  "config.json" 
  "generation_config.json"
  "model.safetensors"
  "quantize_config.json"
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
