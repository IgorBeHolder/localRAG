#!/bin/bash

(
echo "Building the vllm container..."

# cd vllm/docker

git checkout main

docker run --gpus all \
    -p 3003:3003 \
    -v ./model-store/:/model-store/ \
    --name vllm-cont \
    ghcr.io/mistralai/mistral-src/vllm:latest \
    --host 0.0.0.0 \
    --port 3003 \
    --model="model-store/mistralai/Mistral-7B-Instruct-v0.1"


# docker-compose -p localrag -f docker-compose.yml up  --build

) 
