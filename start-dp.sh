#!/bin/bash

(
echo "Starting the docs processor...(hotdir watch)"
cd anything-llm/ && ./start_docs_proc.sh 
) &
