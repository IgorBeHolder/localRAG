#!/bin/bash

(
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
echo "Main service started."
)