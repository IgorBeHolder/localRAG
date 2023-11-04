# Stage 1: Builder stage
FROM python:3.11-slim

COPY requirements.txt .

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache/pip/*

COPY ./app ./app


CMD ["python", "app/bootstrap.py"]
