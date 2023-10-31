#!/bin/bash

echo "Current directory: $(pwd)"

# create docker network if it doesn't exist
docker network ls | grep -q "llm-net" || docker network create "llm-net"

# echo "Untar sherpa-aiserver tar files..."
# tar -xzvf sherpa-aiserver-cpu.tar.gz
# tar -xzvf models.tar.gz

# echo "Loading sherpa-aiserver docker images..."
# docker load -i docker-images-cpu.tar

# create folders for document processor
echo "Creating folders for document processor..."
mkdir -p ./anything-llm/server/storage
mkdir -p ./anything-llm/collector/hotdir
mkdir -p ./anything-llm/collector/outputs

# set permissions for document processor folders
echo "Setting permissions for document processor folders..."
sudo chmod -R 777 ./anything-llm/server/storage
sudo chmod -R 777 ./anything-llm/collector/hotdir
sudo chmod -R 777 ./anything-llm/collector/outputs

(
echo "Starting the embedding model server..."

container_id=$(docker ps -a -q -f name=^/embed$)
if [ ! -z "$container_id" ]; then
  docker stop "$container_id"
  docker rm "$container_id"
fi
docker run -d --restart always \
  --name embed \
  --platform linux/amd64 \
  --env-file ./client-files/.embed-env \
  -v ./model-store/:/app/model-store \
  -p 3004:3004 \
  --network llm-net \
  embed:v1
echo -e "Embedding model server started.\n-----------------------------"
) &&


# (
# echo "Starting the vllm container..."
# if docker ps -a | grep -q "vllm"; then
#   docker stop vllm
#   docker rm vllm
# fi
# docker run --gpus all --restart always \
#     -p 3003:3003 \
#     -v ./model-store/:/model-store/ \
#     --name vllm \
#     ghcr.io/mistralai/mistral-src/vllm:latest \
#     --host 0.0.0.0 \
#     --port 3003 \
#     --model="/model-store/mistralai/Mistral-7B-Instruct-v0.1"
# ) &

(
echo "Starting the main model server..."

container_id=$(docker ps -a -q -f name=^/llm-server$)
if [ ! -z "$container_id" ]; then
  docker stop "$container_id"
  docker rm "$container_id"
fi

docker run -d \
  --name llm-server \
  --platform linux/amd64 \
  -e HOST=0.0.0.0 \
  -e PORT=3003 \
  -v ./model-store:/app/model-store \
  -p 3003:3003 \
  --ulimit memlock=17179869184:17179869184 \
  --network llm-net \
  llm-server-cpu:v1
echo -e "Main model server started.\n-----------------------------"
) &&

(
echo "Starting the Nginx server..."
if docker ps -a | grep -q "nginx"; then
  docker stop nginx
  docker rm nginx
fi
docker run -d \
  --name nginx \
  -p 3002:3002 \
  --network llm-net \
  nginx:latest
echo -e "Nginx server started.\n-----------------------------"
) &&

(
echo "Starting the main service..."

container_id=$(docker ps -a -q -f name=^/anyth$)
if [ ! -z "$container_id" ]; then
  docker stop "$container_id"
  docker rm "$container_id"
fi

docker run -d \
  --name anyth \
  --platform linux/amd64 \
  --env-file ./client-files/.env \
  --user "${1000}:${1000}" \
  -v ./anything-llm/server/storage:/app/server/storage \
  -v ./anything-llm/collector/hotdir/:/app/collector/hotdir \
  -v ./anything-llm/collector/outputs/:/app/collector/outputs \
  -p 3001:3001 \
  --network llm-net \
  anyth-cpu:v1
echo -e "Main service started.\n-----------------------------"
)