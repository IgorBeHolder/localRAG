#!/bin/bash

(
echo "Building the main model container..."
cd vllm/docker && 
git checkout main &&
docker-compose -p localrag up  --build
# docker-compose -p localrag up
) 

wait
