#!/bin/bash

# Define variables
CONTAINER_NAME="postgres"
VOLUME_NAME="localrag_pgdata"
IMAGE_NAME="pgembeding"
COMPOSE_FILE_PATH="./docker-compose.yml"

# Stop and remove the container
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME

# Remove the associated volume (Warning: This will delete your database data!)
docker volume rm $VOLUME_NAME

# Rebuild and restart the container
docker build -t pgembeding .
docker-compose -f $COMPOSE_FILE_PATH -p localrag up -d --build

# chmod +x reinit-db.sh
