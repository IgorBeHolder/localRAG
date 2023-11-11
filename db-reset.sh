#!/bin/bash

# Stop the container
docker stop anyth && \

# Function to remove a file if it exists
remove_if_exists() {
  if [ -f "$1" ]; then
    rm "$1"
  fi
}

# Function to remove a directory if it exists
remove_dir_if_exists() {
  if [ -d "$1" ]; then
    rm -rf "$1"
  fi
}

# delete db, vector cache, and custom documents if they exist
remove_if_exists "./anything-llm/server/storage/anythingllm.db"
remove_dir_if_exists "./anything-llm/server/hotdir/storage/lancedb/"
remove_dir_if_exists "./anything-llm/server/storage/documents/custom-documents/"

# copy anythingllm.db and set permissions
cp ./client-files/storage/anythingllm.db ./anything-llm/server/storage/anythingllm.db
chmod 777 ./anything-llm/server/storage/anythingllm.db

# run script to start containers
./client-files/client-startup.sh
