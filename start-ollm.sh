#!/bin/bash

(
echo "Building the oLLM container..."
set -a
echo $PWD
source ./client-files/.env
set +a
echo -e "Environment variables loaded.\nBuild for $DEVICE.\n$COMPLETION_MODEL_NAME\n-----------------------------"
echo -e "\nR_PENALTY: $R_PENALTY.  F_PENALTY: $F_PENALTY  P_PENALTY: $P_PENALTY TOP_P: $TOP_P\n"


# git checkout main


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

container_id=$(docker ps -a -q -f name=^/llm-server$)
if [ ! -z "$container_id" ]; then
    echo "***** Removing existing container with name 'llm-server'..."
    docker rm -f $container_id
fi

cd openchat
# docker-compose -p localrag -f docker-compose.yml up --build
docker-compose -p localrag -f docker-compose.yml up -d

)

