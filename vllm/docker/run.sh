#!/bin/bash
# /root/localRAG/model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ
# MODEL_NAME="$1"
# test -n "$MODEL_NAME"
# MODEL_DIR="$HOME/localRAG/model-store/$MODEL_NAME"
# echo "MODEL_DIR=$MODEL_DIR"
# test -d "$MODEL_DIR"
# python3 -O -u -m vllm.entrypoints.openai.api_server \
    # --host=$HOST \
    # --port=$PORT \
    # --model=$MODEL_DIR \
    # --host="0.0.0.0" \
    # --port="3003" \
    # --model="../../model-store/mistralai/Mistral-7B-Instruct-v0.1-AWQ" \
    # --quantization="awq"
    # --tokenizer=hf-internal-testing/llama-tokenizer
    # --download-dir ./model-store &&

python -m vllm.entrypoints.openai.api_server \
    --model "../../model-store/$COMPLETION_MODEL_NAME" \
    --port $MM_PORT \
    --host $HOST



# run script:
# ./start-vllm.sh mistralai/Mistral-7B-Instruct-v0.1 
