#!/bin/sh

printf "Environment variables loaded.\n"
printf "*************************"
printf "Build for $DEVICE.\n"
printf "$COMPLETION_MODEL_NAME\nHOST: $HOST PORT: $MM_PORT n_ctx: $N_CTX.\n"
printf "*************************"

python3 -m llama_cpp.server \
    --model "/app/model-store/$COMPLETION_MODEL_NAME" \
    --host $HOST \
    --port $MM_PORT \
    --tokenizer.ggml.add_bos_token false
    # --n_gpu_layers $N_GPU_LAYERS \
    # --chat_format $CHAT_FORMAT \
    # --n_ctx $N_CTX