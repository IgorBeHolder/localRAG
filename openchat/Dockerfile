# Stage 1: Builder stage
FROM python:3.11-slim

# COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir ochat


COPY ./run.sh ./run.sh
RUN chmod +x ./run.sh


CMD ["/bin/sh", "/run.sh"]

# TO BUILD THIS IMAGE:
# docker build -t ollm:latest .

