#!/bin/bash

(
echo "Starting the embedding model server..."
set -a
echo $PWD
source ./client-files/.env
set +a
echo -e "Environment variables loaded.\n\nBuild for $DEVICE.\n$EMBEDDING_MODEL_NAME"
echo -e "---------------------------------------------------------------"


# Define a function to remove a container by name if it exists
stop_container_if_exists() {
  local container_name=$1
  local container_id=$(docker ps -a -q -f name=^/${container_name}$)
  if [ ! -z "$container_id" ]; then
    echo "Stopping existing container with name '${container_name}'..."
    docker stop $container_id
  fi
}

# Remove containers if they exist
stop_container_if_exists "embed"
stop_container_if_exists "nginx"
stop_container_if_exists "postgres"

cd embed-server &&
# todo revert
#git checkout main &&
docker-compose -p localrag up -d --build

)

