#!/bin/sh

python3 -m llama_cpp.server \
    --model model-store/llama-2-7b-chat.Q4_K_M.gguf \
    --host $HOST \
    --port $PORT \
    --n_ctx 4096
    # --n_ctx 2048    