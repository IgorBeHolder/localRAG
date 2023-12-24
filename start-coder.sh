#!/bin/bash

(
echo "Starting the DA processor..."

cd coder && docker-compose -p localrag up -d --build
) 
