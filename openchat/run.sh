#!/bin/sh

echo $PWD
printf "Environment variables loaded.\n"
printf "*************************"
printf "Build for $DEVICE.\n"
printf "ollm server: $COMPLETION_MODEL_NAME\nHOST: $HOST PORT: $MM_PORT n_ctx: $N_CTX.\n"
printf "*************************"


python -m ochat.serving.openai_api_server \
    --model /app/model-store/openchat/openchat-3.5-1210 \
    --host $HOST \
    --port $MM_PORT

    # --model "/app/model-store/$COMPLETION_MODEL_NAME" \