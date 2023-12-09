#!/bin/bash
set -e

# Set the file name as a variable
tarball_name="sherpa-aiserver-gpu_v0.2.tar"

# save docker images to a tarball
echo "Saving docker images to a tarball..."
docker save -o "$tarball_name" \
nginx:latest \
anyth:v1 \
embed:v1 \
pgembeding:latest \
vllm/vllm-openai
# ghcr.io/mistralai/mistral-src/vllm:latest
echo "Docker images saved to a tarball."

# Create a compressed tarball
echo "Compressing tarball..."
tar -czvf "$tarball_name.gz" \
"$tarball_name"  \
./vllm/docker/docker-compose.yml \
./db-reset.sh \
./client-files/ 
# ./start.sh \
# ./start-em.sh \
# ./start-mm.sh \
# ./start-vllm.sh \
echo "Tarball compressed."

rm "$tarball_name"

# Generate MD5 checksum and save to a file
md5sum "$tarball_name.gz" > "md5sum_$tarball_name.gz.txt"

echo "md5sum saved to md5sum_$tarball_name.gz.txt"

echo "Script completed successfully."