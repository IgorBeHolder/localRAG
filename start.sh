#!/bin/bash
(
echo "Starting the main app..."
cd anything-llm
git checkout main
cd docker
docker-compose -p localrag up -d --build

)