# Stage 1: Builder stage
FROM python:3.11-slim

COPY requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install --no-cache-dir ochat && \
    rm -rf /root/.cache/pip/*

# COPY ./app ./app


CMD ["/bin/sh", "/run.sh"]

# python -m ochat.serving.openai_api_server --model openchat/openchat-3.5-1210

# N is the number of tensor parallel GPUs
# python -m ochat.serving.openai_api_server --model openchat/openchat-3.5-1210 --engine-use-ray --worker-use-ray --tensor-parallel-size N