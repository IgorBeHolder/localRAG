#!/bin/bash

(
echo "Building the vllm container..."
cd vllm/docker && 
git checkout main &&
docker-compose -p localrag  up  --build
# docker-compose -p localrag up
) 


