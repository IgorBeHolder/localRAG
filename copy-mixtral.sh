# Constants
# as we are at localRAG already, we can use relative paths:
BASE_DIR="./model-store/TheBloke/Mixtral-8x7B-Instruct-v0.1-GGUF"
BASE_URL="https://huggingface.co/TheBloke/Mixtral-8x7B-Instruct-v0.1-GGUF/resolve/main"

# Create the directory
sudo mkdir -p "$BASE_DIR"
sudo chmod 755 "$BASE_DIR"

# Download files and set permissions
declare -a files=(
  ".gitattributes" "README.md" "config.json" 
  "mixtral-8x7b-instruct-v0.1.Q5_K_M.gguf"
)

for file in "${files[@]}"
do
   sudo curl -o "$BASE_DIR/$file" -L "$BASE_URL/$file"
   sudo chmod 644 "$BASE_DIR/$file"
   echo "Downloaded and set permissions for $BASE_DIR/$file"
done
