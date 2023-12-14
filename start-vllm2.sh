docker run --runtime nvidia --gpus all \
    -p 8000:8000 \
    --ipc=host \
    vllm/vllm-openai:latest \
    --model /model-store/mistralai/Mistral-7B-Instruct-v0.1
    # -v ~/.cache/huggingface:/root/.cache/huggingface \
    # --env "HUGGING_FACE_HUB_TOKEN=<secret>"