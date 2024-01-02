#!/bin/bash
set -e

# Set the file name as a variable
tarball_name="models_cpu_v0.5.tar.gz"

# Create a compressed tarball
echo "Compressing tarball..."
tar -czvf "$tarball_name" \
  ./model-store/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 \
  ./model-store/TheBloke/openchat-3.5-1210-GGUF/openchat-3.5-1210.Q6_K.gguf

echo "Tarball compressed."

# Generate MD5 checksum and save to a file
md5sum "$tarball_name" > "md5sum_$tarball_name.txt"

echo "md5sum saved to md5sum_$tarball_name.txt"

echo "Script completed successfully."
