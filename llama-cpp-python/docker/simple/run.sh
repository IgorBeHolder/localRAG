#!/bin/sh

echo $HOST
echo $PORT
python3 -m llama_cpp.server \
    # --model model-store/llama-2-7b-chat.Q4_K_M.gguf \
    --model model-store/mistral-7b-instruct-v0.1.Q4_K_M.gguf \
    --host $HOST \
    --port $PORT \
    # --n_ctx 4096
    --n_ctx 2048    