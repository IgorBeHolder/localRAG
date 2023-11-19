#!/bin/bash

(
echo "Building the main model container..."

# Check if the "llm-server" container is already running and remove it if it is
container_id=$(docker ps -a -q -f name=^/llm-server$)
if [ ! -z "$container_id" ]; then
    echo "Removing existing container with name 'llm-server'..."
    docker rm -f $container_id
fi

cd llama-cpp-python/docker/simple && 
git checkout main &&
docker-compose -p localrag up -d --build

)
