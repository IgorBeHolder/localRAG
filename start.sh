#!/bin/bash
(
echo "Starting the main app..."
container_id=$(docker ps -a -q -f name=^/anyth$)
if [ ! -z "$container_id" ]; then
    echo "Removing existing container with name 'anyth'..."
    docker rm -f $container_id
fi

cd anything-llm
git checkout main
cd docker
docker-compose -p localrag up -d --build

)