#!/bin/bash

(
echo "Building the LLM engine (main model) container..."
set -a
echo $PWD
source ./client-files/.env
set +a
echo -e "Environment variables loaded."
echo -e "Build for $DEVICE."
echo -e "$COMPLETION_MODEL_NAME\n--------------------------------------------"

# Check if the "llm-server" container is already running and remove it if it is
container_id=$(docker ps -a -q -f name=^/llm-server$)
if [ ! -z "$container_id" ]; then
    echo "Stopping existing container with name 'llm-server'..."
    docker stop $container_id
    echo "Removing existing container with name 'llm-server'..."
    docker rm -f $container_id
fi

if [ "$DEVICE" = "cpu" ]; then
    cd llama-cpp-python/docker/simple
    echo "Building the LLAMA powered for CPU container..."

    docker-compose -p localrag up -d --build
else
    cd llama-cpp-python/docker/cuda_simple
    echo "Building the LLAMA powered for CUDA container..."

    docker-compose -p localrag up -d --build
fi

)
