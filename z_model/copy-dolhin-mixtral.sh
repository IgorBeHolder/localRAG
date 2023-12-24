# Constants
# as we are at localRAG already, we can use relative paths:
BASE_DIR="../model-store/TheBloke/dolphin-2.5-mixtral-8x7b-GGUF"
BASE_URL="https://huggingface.co/TheBloke/dolphin-2.5-mixtral-8x7b-GGUF/resolve/main"

# Create the directory
sudo mkdir -p "$BASE_DIR"
sudo chmod 755 "$BASE_DIR"

# Download files and set permissions
declare -a files=(
  ".gitattributes" 
  "README.md" 
  "config.json" 
  "dolphin-2.5-mixtral-8x7b.Q6_K.gguf"
# SHA256: 7ffbe467a18122de2a16772e7fcd3ccd6131203c2ce721f53fab03446a246684
)

for file in "${files[@]}"
do
   sudo curl -o "$BASE_DIR/$file" -L "$BASE_URL/$file"
   sudo chmod 644 "$BASE_DIR/$file"
   echo "Downloaded and set permissions for $BASE_DIR/$file"
done
