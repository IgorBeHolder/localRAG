#!/bin/sh

echo $PWD
printf "Environment variables loaded.\n"
printf "*************************"
printf "Build for $DEVICE.\n"
printf "ollm server: $COMPLETION_MODEL_NAME\nHOST: $HOST PORT: $PORT.\n"
printf "*************************"


python -m ochat.serving.openai_api_server \
    --model=/model-store/${COMPLETION_MODEL_NAME} \
    --host $HOST \
    --port $PORT

    # --model "/app/model-store/$COMPLETION_MODEL_NAME" \