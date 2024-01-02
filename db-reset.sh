#!/bin/bash

# Function to remove a file if it exists
remove_if_exists() {
  if [ -f "$1" ]; then
    rm "$1"
    echo "Removed $1"
  fi
}

# Function to remove a directory if it exists
remove_dir_if_exists() {
  if [ -d "$1" ]; then
    sudo chmod -R 777 "$1"
    rm -rf "$1"
    echo "Removed $1"
  fi
}

# Check if container exists and stop it
container_id=$(docker ps -a -q -f name=^/anyth$)
if [ ! -z "$container_id" ]; then
  echo "Stopping ANYTH container..."
  docker stop "$container_id"
else
  echo "No ANYTH container found to stop."
fi

echo "Removing db, cache files..."
remove_if_exists "./anything-llm/server/storage/anythingllm.db"
remove_dir_if_exists "./anything-llm/server/storage/lancedb/"
remove_dir_if_exists "./anything-llm/server/storage/documents/custom-documents/"
remove_dir_if_exists "./anything-llm/server/storage/vector-cache/"

echo "Copying db file..."
cp ./client-files/anythingllm.db ./anything-llm/server/storage/anythingllm.db
chmod 777 ./anything-llm/server/storage/anythingllm.db


container_id=$(docker ps -a -q -f name=^/anyth$)
if [ ! -z "$container_id" ]; then

  # docker start "$container_id"
    echo "Starting the WEB server..."
else
  docker run -d --restart always \
    --name anyth \
    --platform linux/amd64 \
    --env-file ./client-files/.env \
    --user "${ARG_UID}:${ARG_GID}" \
    -v ./anything-llm/server/storage:/app/server/storage \
    -v ./anything-llm/collector/hotdir/:/app/collector/hotdir \
    -v ./anything-llm/collector/outputs/:/app/collector/outputs \
    -v ./anything-llm/collector/outputs/:/app/server/storage/coder \
    -p 3001:3001 \
    --network llm-net \
    anyth:last_com

  echo -e "Web server started.\n-----------------------------"
fi



