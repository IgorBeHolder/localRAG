#!/bin/bash
set -e

cd anythingLLM
git checkout main
cd docker
docker-compose up --build
# docker-compose up 

wait