#!/bin/bash

(
echo "Building the vllm container..."
cd vllm/docker && 
git checkout main &&
# docker-compose -p localrag  up  --build
# docker-compose -p localrag up

# Build the Docker image
docker build -t vllm-container .

# Run the Docker container
docker run --gpus all -it --rm --ipc=host --name localrag vllm-container
) 


