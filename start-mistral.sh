#!/bin/bash

(
echo "Building the vllm container..."

cd vllm/docker

git checkout main

docker-compose -p localrag -f docker-compose-mistral.yml up --build

) 
