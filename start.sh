#!/bin/bash
set -e

cd anything-llm
git checkout main
cd docker
docker-compose -p localrag -d up --build
# docker-compose -p localrag up

wait