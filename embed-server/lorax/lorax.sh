#!/bin/bash

model=mistralai/Mistral-7B-Instruct-v0.1
volume=$PWD/data # share a volume with the Docker container to avoid downloading weights every run


container_id=$(docker ps -a -q -f name=^/lorax$)
if [ ! -z "$container_id" ]; then
    echo "Removing existing container with name '$container_id'..."
    docker rm -f $container_id
fi
docker run --name lorax --gpus all --shm-size 1g -p 8080:80 -v $volume:/data ghcr.io/predibase/lorax:latest --model-id $model

