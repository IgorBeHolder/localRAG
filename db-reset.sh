#!/bin/bash

# Stop the container
echo "Stopping ANYTH container..."
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

echo "Removing db, cache files..."
remove_if_exists "./anything-llm/server/storage/anythingllm.db"
remove_dir_if_exists "./anything-llm/server/hotdir/storage/lancedb/"
remove_dir_if_exists "./anything-llm/server/storage/documents/custom-documents/"

echo "Copying db file..."
cp ./client-files/anythingllm.db ./anything-llm/server/storage/anythingllm.db
chmod 777 ./anything-llm/server/storage/anythingllm.db

echo "Run containers ..."
./client-files/client-startup.sh