#!/bin/bash

(
echo "Starting the docs processor...(hotdir watch)"
lsof -i :3005 | awk 'NR>1 {print $2}' | xargs kill -9
cd anything-llm/ && ./start_docs_proc.sh
) &
