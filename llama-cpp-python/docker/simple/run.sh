#!/bin/sh
set -a
echo $PWD
source ./client-files/.env
set +a
echo -e "Environment variables loaded.\nBuild for $DEVICE.\n$COMPLETION_MODEL_NAME\n-----------------------------"


python3 -m llama_cpp.server \
    --model "$COMPLETION_MODEL_NAME" \
    --host $HOST \
    --port $PORT \
    --n_ctx 2048

# --model model-store/llama-2-7b-chat.Q4_K_M.gguf \
# --model model-store/mistral-7b-instruct-v0.1.Q4_K_M.gguf \
# --model model-store/openchat/openchat_3.5 \