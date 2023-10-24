# Constants
BASE_DIR="/localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ"
BASE_URL="https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-AWQ/blob/main"
LFS_URL="https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-AWQ/resolve/main"

# Create the directory
sudo mkdir -p $BASE_DIR

# Download regular files
declare -a files=(".gitattributes" "README.md" "config.json" "generation_config.json" "quant_config.json" "special_tokens_map.json" "tokenizer.json" "tokenizer_config.json")

for file in "${files[@]}"
do
   if [ ! -f "$BASE_DIR/$file" ]; then
      sudo curl -o "$BASE_DIR/$file" -L "$BASE_URL/$file"
   else
      echo "File $BASE_DIR/$file already exists. Skipping download."
   fi
done

# Download Git LFS files
declare -a lfs_files=("model.safetensors" "tokenizer.model")

for lfs_file in "${lfs_files[@]}"
do
   if [ ! -f "$BASE_DIR/$lfs_file" ]; then
      sudo curl -o "$BASE_DIR/$lfs_file" -L "$LFS_URL/$lfs_file"
   else
      echo "File $BASE_DIR/$lfs_file already exists. Skipping download."
   fi
done
