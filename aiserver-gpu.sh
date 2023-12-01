#!/bin/bash
set -e

tarball_name="sherpa-aiserver_v0.1.tar"
docker save -o "$tarball_name" \
anyth-cpu:v1 \
embed:v1 \
nginx:latest \
pgembeding:latest \
ghcr.io/mistralai/mistral-src/vllm:latest &&

tar -czvf "$tarball_name.gz" \
docker-images-gpu.tar  \
./client-files &&

# Generate MD5 checksum and save to a file
md5sum "$tarball_name.gz" > "md5sum_$tarball_name.gz.txt"

echo "Script completed successfully."