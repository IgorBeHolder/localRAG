# Constants
# as we are at localRAG already, we can use relative paths:
BASE_DIR="../model-store/openchat/openchat-3.5-1210"
BASE_URL="https://huggingface.co/openchat/openchat-3.5-1210/resolve/main"

# Create the directory
sudo mkdir -p "$BASE_DIR"
sudo chmod 755 "$BASE_DIR"

# Download files and set permissions
declare -a files=(
  ".gitattributes" 
  "README.md"  
  "added_tokens.json" 
  "config.json" 
  "generation_config.json" 
  "model-00001-of-00003.safetensors" 
  # SHA256: c65531d6a5a9bb8345aa117528f3f4105b0bf357eab647519c19b4dca952e89b
  "model-00002-of-00003.safetensors" 
  # SHA256: 26b18d5d207afd2257427cfa2a7f5f041bea575b77113855a25faae88d82c408
  "model-00003-of-00003.safetensors" 
  # SHA256: 3ff9fa33b10323cb7604dfa9da1d0fac1af5f2aa485744031b5f43d0d8885563
  "model.safetensors.index.json" 
  "openchat.json" 
  "special_tokens_map.json" 
  "tokenizer.model" 
  "tokenizer_config.json" 
)

for file in "${files[@]}"
do
   sudo curl -o "$BASE_DIR/$file" -L "$BASE_URL/$file"
   sudo chmod 644 "$BASE_DIR/$file"
   echo "Downloaded and set permissions for $BASE_DIR/$file"
done

# do not forget to: 
# chmod +x copy-openchat.sh
