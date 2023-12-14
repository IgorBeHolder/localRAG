#!/bin/bash
(
echo "Starting the main app..."
container_id=$(docker ps -a -q -f name=^/anyth$)
if [ ! -z "$container_id" ]; then
    echo "Removing existing container with name 'anyth'..."
    docker rm -f $container_id
fi

cd anything-llm
# todo revert
#git checkout main
cd docker
docker-compose --env-file ../../client-files/.env -p localrag up -d --build
# docker-compose --env-file ../../client-files/.env -p localrag up -d
# here we use .env from the common project folder
)
