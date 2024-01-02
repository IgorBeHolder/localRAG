#!/bin/sh

echo $PWD
printf "Environment variables loaded.\n"
printf "*************************"
printf "Build for $DEVICE.\n"
printf "ollm server: $COMPLETION_MODEL_NAME\nHOST: $HOST PORT: $MM_PORT.\n"
printf "*************************"


python -m ochat.serving.openai_api_server \
    --model "/model-store/${COMPLETION_MODEL_NAME}" \
    --host $HOST \
    --port $MM_PORT

    # --model "/app/model-store/$COMPLETION_MODEL_NAME" \

    # python -m ochat.serving.openai_api_server --model openchat/openchat-3.5-1210

# N is the number of tensor parallel GPUs
# python -m ochat.serving.openai_api_server --model openchat/openchat-3.5-1210 --engine-use-ray --worker-use-ray --tensor-parallel-size N