#!/bin/bash

(
echo "Starting the embedding model server..."
set -a
echo $PWD
source ./client-files/.env
set +a
echo -e "Environment variables loaded.\nBuild for $DEVICE.\n$COMPLETION_MODEL_NAME\n-----------------------------"


# Define a function to remove a container by name if it exists
remove_container_if_exists() {
  local container_name=$1
  local container_id=$(docker ps -a -q -f name=^/${container_name}$)
  if [ ! -z "$container_id" ]; then
    echo "Removing existing container with name '${container_name}'..."
    docker rm -f $container_id
  fi
}

# Remove containers if they exist
remove_container_if_exists "embed"
remove_container_if_exists "nginx"
remove_container_if_exists "postgres"

cd embed-server &&
git checkout main &&
docker-compose -p localrag up -d --build

)

