# Constants
# as we are at localRAG already, we can use relative paths:
BASE_DIR="./model-store/TheBloke/openchat_3.5-GGUF"
BASE_URL="https://huggingface.co/TheBloke/openchat_3.5-GGUF/resolve/main"

# Create the directory
sudo mkdir -p "$BASE_DIR"
sudo chmod 755 "$BASE_DIR"

# Download files and set permissions
declare -a files=(
  ".gitattributes" "README.md" "config.json" 
  "openchat_3.5.Q4_K_M.gguf" 
)

for file in "${files[@]}"
do
   sudo curl -o "$BASE_DIR/$file" -L "$BASE_URL/$file"
   sudo chmod 644 "$BASE_DIR/$file"
   echo "Downloaded and set permissions for $BASE_DIR/$file"
done
