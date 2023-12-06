#!/bin/bash

(
echo "Building the VLLM container..."
set -a
echo $PWD
source ./client-files/.env
set +a
echo -e "Environment variables loaded.\nBuild for $DEVICE.\n$COMPLETION_MODEL_NAME\n-----------------------------"

cd vllm/docker
git checkout main

# Check if the "vllm-cont" container is running and stop it if it is
container_id=$(docker ps -a -q -f name=^/vllm$)
if [ ! -z "$container_id" ]; then
    echo "Removing existing container with name 'vllm'..."
    docker rm -f $container_id
fi
# Check if the "llm-server-cpu" container is running and stop it if it is
container_id=$(docker ps -a -q -f name=^/llm-server$)
if [ ! -z "$container_id" ]; then
    echo "Removing existing container with name 'llm-server-cpu'..."
    docker rm -f $container_id
fi

# docker-compose -p localrag -f docker-compose.yml up --build
docker-compose -p localrag -f docker-compose.yml up -d

)




# git checkout main

# docker run --gpus all --restart always \
#     -p 3003:3003 \
#     -v ./model-store/:/model-store/ \
#     --name vllm-cont \
#     ghcr.io/mistralai/mistral-src/vllm:latest \
#     --host 0.0.0.0 \
#     --port 3003 \
#     --model="/model-store/mistralai/Mistral-7B-Instruct-v0.1"

# ) 
