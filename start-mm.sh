#!/bin/bash

(
echo "Building the main model container..."
cd llama-cpp-python/docker/simple && 
git checkout main &&
docker-compose -p localrag up -d --build

) 

