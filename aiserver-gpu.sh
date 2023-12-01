#!/bin/bash
set -e

# Set the file name as a variable
tarball_name="sherpa-aiserver_v0.1.tar"

# save docker images to a tarball
echo "Saving docker images to a tarball..."
docker save -o "$tarball_name" \
anyth:v1 \
embed:v1 \
nginx:latest \
pgembeding:latest \
ghcr.io/mistralai/mistral-src/vllm:latest &&
echo "Docker images saved to a tarball."

# Create a compressed tarball
echo "Compressing tarball..."
tar -czvf "$tarball_name.gz" \
docker-images-gpu.tar  \
./client-files &&
echo "Tarball compressed."

# Generate MD5 checksum and save to a file
md5sum "$tarball_name.gz" > "md5sum_$tarball_name.gz.txt"

echo "Script completed successfully."