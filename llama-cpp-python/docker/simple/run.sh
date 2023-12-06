#!/bin/sh

echo $PWD
echo -e "Environment variables loaded.\nBuild for $DEVICE.\n$COMPLETION_MODEL_NAME:\nHOST: $HOST PORT: $EM_PORT n_ctx: $N_CTX\n-----------------------------"


python3 -m llama_cpp.server \
    --model "$COMPLETION_MODEL_NAME" \
    --host $HOST \
    --port $MM_PORT \
    --n_ctx $N_CTX