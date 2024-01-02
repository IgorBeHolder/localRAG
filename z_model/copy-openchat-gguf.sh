# Constants
# as we are at localRAG already, we can use relative paths:
BASE_DIR="../model-store/TheBloke/openchat-3.5-1210-GGUF"
BASE_URL="https://huggingface.co/TheBloke/openchat-3.5-1210-GGUF/resolve/main"

# Create the directory
sudo mkdir -p "$BASE_DIR"
sudo chmod 755 "$BASE_DIR"

# Download files and set permissions
declare -a files=(
  ".gitattributes" 
  "README.md" 
  "config.json" 
  "openchat-3.5-1210.Q6_K.gguf" 
  # SHA256: 697b7eb96a32befe3fc18761157085121346bbc7358caea1aa5fdf4c9bdfc69a
)

for file in "${files[@]}"
do
   sudo curl -o "$BASE_DIR/$file" -L "$BASE_URL/$file"
   sudo chmod 644 "$BASE_DIR/$file"
   echo "Downloaded and set permissions for $BASE_DIR/$file"
done
