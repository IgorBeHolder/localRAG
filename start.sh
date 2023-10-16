#!/bin/bash
set -e

cd anything-llm
git checkout main
cd docker
docker-compose up --build
# docker-compose up 

wait