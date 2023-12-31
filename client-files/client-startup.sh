#!/bin/bash

# GPU_ARCHIVE="aiserver-openchat_v0.2.tar.gz"
# CPU_ARCHIVE="sais-mistral-cpu.tar.gz"

# Load environment variables from .env file
set -a
source ./client-files/.env
set +a
echo -e "Environment variables loaded.\nBuild for $DEVICE.\n-----------------------------"

echo "Current directory: $(pwd)"

# create docker network if it doesn't exist
docker network ls | grep -q "llm-net" || docker network create "llm-net"

echo "Loading sherpa-aiserver docker images..."
# Check if images have already been loaded (not direct checking)
images_loaded() {
    [ -f db-reset.sh ]
}
if ! images_loaded; then
  if [ "$DEVICE" = "cpu" ]; then
    echo "Loading CPU docker images..."
    sudo docker load -i  $CPU_ARCHIVE
  else
    echo "Loading GPU docker images..."
    sudo docker load -i  $GPU_ARCHIVE
  fi
else
  echo "Docker images have been loaded previously."
fi

# create folders for document processor
echo "Creating folders for document processor..."
mkdir -p ./anything-llm/server/storage
mkdir -p ./anything-llm/collector/hotdir
mkdir -p ./anything-llm/collector/outputs
mkdir -p ./anything-llm/server/storage/coder

# set permissions for document processor folders
echo "Setting permissions for document processor folders..."
sudo chmod -R 777 ./anything-llm/server/storage
sudo chmod -R 777 ./anything-llm/collector/hotdir
sudo chmod -R 777 ./anything-llm/collector/outputs
sudo chmod -R 777 ./anything-llm/server/storage/coder

(
echo "Starting the EMBEDDING model server..."

container_id=$(docker ps -a -q -f name=^/embed$)
if [ ! -z "$container_id" ]; then
  docker start "$container_id"
else
  docker run -d --restart always \
    --name embed \
    --platform linux/amd64 \
    --env-file ./client-files/.env \
    -v ./model-store/:/app/model-store \
    -p $EM_PORT:$EM_PORT \
    --network llm-net \
    embed:v1
fi
echo -e "Embedding model server started.\n-----------------------------"
) &&

if [ "$DEVICE" = "cpu" ]; then
  (
  echo "Starting the LLM-server CPU ..."

  container_id=$(docker ps -a -q -f name=^/llm-server$)
  if [ ! -z "$container_id" ]; then
    docker start "$container_id"
  else
    docker rm  "$container_id" &&
    echo "Start LLM-server for $COMPLETION_MODEL_NAME"
    docker run -d \
      --name llm-server \
      --restart always \
      --platform linux/amd64 \
      -e HOST=$HOST \
      -e MM_PORT=$MM_PORT \
      -e DEVICE=$DEVICE \
      -e N_CTX=$N_CTX \
      -e COMPLETION_MODEL_NAME=$COMPLETION_MODEL_NAME \
      -v ./model-store:/app/model-store \
      -p $MM_PORT:$MM_PORT \
      --ulimit memlock=17179869184:17179869184 \
      --network llm-net \
      llm-server:v2
  fi
  echo -e "Main model server started.\n-----------------------------"
  )
else
  (
  echo "Starting the VLLM container GPU..."
  
  container_id=$(docker ps -a -q -f name=^/vllm$)
  if [ ! -z "$container_id" ]; then

    docker start "$container_id"
  else
    cd vllm/docker
    docker-compose -p localrag -f docker-compose.yml up -d
  fi
  echo -e "VLLM container started.\n-----------------------------"
  )
fi

(
echo "Starting the NGINX server..."
container_id=$(docker ps -a -q -f name=^/nginx$)
if [ ! -z "$container_id" ]; then
  docker rm -f "$container_id"
fi
 # docker start "$container_id"
#else
  docker run -d \
    --name nginx \
    --restart always \
    -p 3002:3002 \
    -v ./embed-server/config/:/etc/nginx/sites-enabled \
    --network llm-net \
    nginx:last_com

echo -e "Nginx server started.\n-----------------------------"
) &&

(
echo "Starting the WEB server..."
container_id=$(docker ps -a -q -f name=^/anyth$)
if [ ! -z "$container_id" ]; then
  docker start "$container_id"
else
  docker run -d --restart always \
    --name anyth \
    --platform linux/amd64 \
    --env-file ./client-files/.env \
    --user "${ARG_UID}:${ARG_GID}" \
    -v ./anything-llm/server/storage:/app/server/storage \
    -v ./anything-llm/collector/hotdir/:/app/collector/hotdir \
    -v ./anything-llm/collector/outputs/:/app/collector/outputs \
    -v ./anything-llm/server/storage/coder:/app/server/storage/coder \
    -p 3001:3001 \
    --network llm-net \
    anyth:last_com
fi
echo -e "Web server started.\n-----------------------------"
) &&

(
echo "Starting the POSTGRES server..."
container_id=$(docker ps -a -q -f name=^/postgres$)
if [ ! -z "$container_id" ]; then
  docker start "$container_id"
else
  docker run -d --name postgres \
    --restart always \
    -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
    -p 5432:5432 \
    -v pgdata:/var/lib/postgresql/data \
    --network llm-net \
    pgembeding
fi
echo -e "Postgres server started.\n-----------------------------"
)
