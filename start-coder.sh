#!/bin/bash

(
echo "Starting the DA processor..."

container_id=$(docker ps -a -q -f name=^/coder$)
if [ ! -z "$container_id" ]; then
    echo "Stopping existing container with name 'coder'..."

    docker stop $container_id
    docker rm -f $container_id
fi

cd coder && docker-compose -p localrag up -d --build
# cd coder && docker-compose -p localrag up -d
)
