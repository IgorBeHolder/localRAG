#!/bin/bash

(
echo "Building the LLM engine (main model) container..."
set -a
echo $PWD
source ./client-files/.env
set +a
echo -e "Environment variables loaded."
echo -e "Build for $DEVICE."
echo -e "$COMPLETION_MODEL_NAME\n--------------------------------------------------------"

# Check if the "ollm-cont" container is running and stop it if it is
container_id=$(docker ps -a -q -f name=^/ollm$)
if [ ! -z "$container_id" ]; then
    echo "***** Removing existing container with name 'ollm'..."
    docker rm -f $container_id
fi
container_id=$(docker ps -a -q -f name=^/vllm$)
if [ ! -z "$container_id" ]; then
    echo "***** Removing existing container with name 'vllm'..."
    docker rm -f $container_id
fi
# Check if the "llm-server" container is running and stop it if it is
container_id=$(docker ps -a -q -f name=^/llm-server$)
if [ ! -z "$container_id" ]; then
    echo "***** Removing existing container with name 'llm-server'..."
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
