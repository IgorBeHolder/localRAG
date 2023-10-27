#!/bin/bash
(
cd anything-llm
git checkout main
cd docker
docker-compose -p localrag up -d --build

)