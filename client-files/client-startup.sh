#!/bin/bash

echo "current directory: $(pwd)"

# create folders for document processor
# mkdir -p localRAG/anything-llm/server/storage
# mkdir -p localRAG/anything-llm/collector/hotdir
# mkdir -p localRAG/anything-llm/collector/outputs

# set permissions for document processor folders
sudo chmod -R 777 ../localRAG/anything-llm/server/storage
sudo chmod -R 755 ../localRAG/anything-llm/collector/hotdir
sudo chmod -R 755 ../localRAG/anything-llm/collector/outputs

(
echo "Starting the embedding model server..."

if docker ps -a | grep -q "embed"; then
  docker stop embed
  docker rm embed
fi
docker run -d --restart always \
  --name embed \
  --platform linux/amd64 \
  --env-file ./client-files/.embed-env \
  -v ./model-store/:/app/model-store \
  -p 3004:3004 \
  --network llm-net \
  embed:v1
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

if docker ps -a | grep -q "llama"; then
  docker stop llama
  docker rm llama
fi
docker run -d \
  --name llama \
  --platform linux/amd64 \
  -e HOST=0.0.0.0 \
  -e PORT=3003 \
  -v ./model-store:/app/model-store \
  -p 3003:3003 \
  --ulimit memlock=17179869184:17179869184 \
  --network llm-net \
  llama:v1
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
) &&

(
echo "Starting the main service..."

if docker ps -a | grep -q "anyth"; then
  docker stop anyth
  docker rm anyth
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
  anyth:v1
)