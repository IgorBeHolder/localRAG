FROM python:3.11-slim-bullseye

# Update and upgrade the existing packages 
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ninja-build \
    libopenblas-dev \
    build-essential
# install git to clone the repo (to avoid submodules issue)
RUN apt-get update && apt-get install -y git

RUN mkdir /app
RUN git clone https://github.com/abetlen/llama-cpp-python.git /app
WORKDIR /app
RUN git submodule update --init --recursive

RUN python3 -m pip install --upgrade pip

# Set the environment variable (declared in docker-compose.yml)
ENV CMAKE_ARGS=${CMAKE_ARGS} 

# RUN python3 -m pip install ".[all]" &&\
RUN --mount=type=cache,target=/root/.cache/pip python3 -m pip install ".[all]" &&\
    chmod -R 777 /root/.cache/pip && \
    # cd app
    rm -rf /root/.cache/pip/*

COPY --chmod=755 run.sh /run.sh
CMD ["/bin/sh", "/run.sh"]

