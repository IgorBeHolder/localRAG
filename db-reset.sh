#!/bin/bash

docker stop anyth && \
# delete db, vector cache, and custom documents
rm ./anything-llm/server/storage/anythingllm.db && \
rm -rf .anything-llm/server/hotdir/storage/lancedb/* && \
rm -rf ./anything-llm/server/storage/documents/* && \
# copy anythingllm.db and set permissions
cp ./client-files/storage/anythingllm.db ./anything-llm/server/storage/anythingllm.db && \
chmod 777 ./anything-llm/server/storage/anythingllm.db && \
# run script to start containers
./client-files/client-startup.sh