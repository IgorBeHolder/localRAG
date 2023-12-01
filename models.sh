#!/bin/bash
set -e

# Set the file name as a variable
tarball_name="models_v0.1.tar.gz"

# Create a compressed tarball
tar -czvf "$tarball_name" \
  ./model-store/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 \
  ./model-store/mistralai/Mistral-7B-Instruct-v0.1

# Generate MD5 checksum and save to a file
md5sum "$tarball_name" > "md5sum_$tarball_name.txt"

echo "Script completed successfully."
