#!/bin/bash
set -e

# script to run embedding model server
# (
# echo "Starting the embedding model server..."
# # lsof -i :3004 | awk 'NR>1 {print $2}' | xargs kill -9
# # docker ps -a | grep embed-llm | awk '{print $1}' | xargs docker rm
# cd OpenLLM/docker &&
# git checkout open  &&
# docker-compose up --build
# ) 

(
echo "Starting the embedding model server..."
# lsof -i :3004 | awk 'NR>1 {print $2}' | xargs kill -9
# docker ps -a | grep embed-llm | awk '{print $1}' | xargs docker rm
cd embed-server &&
git checkout main  &&
docker-compose up --build
# docker-compose up 
) 

wait
