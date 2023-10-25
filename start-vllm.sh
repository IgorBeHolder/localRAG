#!/bin/bash

set -e

(
echo "Building the vllm container..."

# Navigate to the directory containing the Docker Compose file
cd vllm/docker

# Ensure you are on the main branch of your Git repository
git checkout main

# Use Docker Compose V2 to build and run the container
# The `--project-name` flag is equivalent to `-p` in Docker Compose V1
docker-compose -p localrag build
docker-compose -p localrag up


) 
