#!/bin/bash

MODEL_NAME="$1"
test -n "$MODEL_NAME"
MODEL_DIR="$HOME/model-store/$MODEL_NAME"
test -d "$MODEL_DIR"
python3 -O -u -m vllm.entrypoints.openai.api_server \
    --host=$HOST \
    --port=$PORT \
    --model=$HOME/model-store/$MODEL_NAME \
    # --tokenizer=hf-internal-testing/llama-tokenizer
    # --download-dir ./model-store &&

# python -m vllm.entrypoints.openai.api_server --model mistralai/Mistral-7B-Instruct-v0.1 --download-dir ./model-store

wait -n
exit $?

# run script:
# ./start-vllm.sh mistralai/Mistral-7B-Instruct-v0.1 
