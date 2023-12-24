#!/bin/sh

echo -e "Environment variables loaded.\n"
echo -e "*************************"
echo -e "Build for $DEVICE.\n"
echo -e "$COMPLETION_MODEL_NAME\nHOST: $HOST PORT: $MM_PORT n_ctx: $N_CTX\n
exho -e "*************************"

python3 -m llama_cpp.server \
    --model "/app/model-store/$COMPLETION_MODEL_NAME" \
    --host $HOST \
    --port $MM_PORT \
    --n_gpu_layers $N_GPU_LAYERS \
    --chat_format $CHAT_FORMAT \
    --n_ctx $N_CTX