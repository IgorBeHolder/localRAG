#!/bin/bash
set -e

cd anything-llm/
git checkout anyth
cd docker
# docker-compose up --build
docker-compose up 

wait