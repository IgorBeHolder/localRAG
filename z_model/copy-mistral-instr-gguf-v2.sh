# Constants
# as we are at localRAG already, we can use relative paths:
BASE_DIR="../model-store/TheBloke/Mistral-7B-Instruct-v0.2-GGUF"
BASE_URL="https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main"

# Create the directory
sudo mkdir -p "$BASE_DIR"
sudo chmod 755 "$BASE_DIR"

# Download files and set permissions
declare -a files=(
  ".gitattributes" 
  "README.md" 
  "config.json"
  # "mistral-7b-instruct-v0.2.Q6_K.gguf"
  "mistral-7b-instruct-v0.2.Q5_K_M.gguf"
# Q5_K_M SHA256: af12961e014037ee8c5c9f3bf7cf9fd99cadc9dabd50f528a4248c4a8ee8fe77
# Q6_K SHA256: a4643671c92f47eb6027d0eff50b9875562e8e172128a4b10b2be250bb4264de
)

for file in "${files[@]}"
do
   sudo curl -o "$BASE_DIR/$file" -L "$BASE_URL/$file"
   sudo chmod 644 "$BASE_DIR/$file"
   echo "Downloaded and set permissions for $BASE_DIR/$file"
done
