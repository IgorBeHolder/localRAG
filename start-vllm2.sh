#!/bin/bash

set -e

(
echo "Building the vllm container..."

# Navigate to the directory containing the Docker Compose file
cd vllm/docker

# Ensure you are on the main branch of your Git repository
git checkout main

# Use Docker Compose V2 to build and run the container
# The `--project-name` flag is equivalent to `-p` in Docker Compose V1
docker run --gpus all \
    -p 3003:3003 \
    -v /model-store/:/model-store/ \
     ghcr.io/mistralai/mistral-src/vllm:latest \
    --host 0.0.0.0 \
    --model="/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ/"

# docker-compose -p localrag -f docker-compose-mistral.yml up  --build

) 
