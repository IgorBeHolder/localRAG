#!/bin/bash
# set -e  # exit on error

# (
# echo "Starting the main model server..."
# # lsof -i :3003 | awk 'NR>1 {print $2}' | xargs kill -9
# cd llama-cpp-python && 
# source .venv/bin/activate &&
# python3 -m llama_cpp.server --model models/llama-2-7b-chat.Q4_K_M.gguf --port 3003 --n_ctx 2048
# ) 

(
echo "Building the main model container..."
cd llama-cpp-python/docker/simple && 
git checkout main &&
docker-compose -p localrag up --build
# docker-compose -p localrag up
) 

wait
