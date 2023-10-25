# FROM nvcr.io/nvidia/pytorch:22.12-py3
FROM python:3.11-slim-bullseye

# Update and upgrade the existing packages 
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip 

RUN apt-get update && apt-get install -y git


RUN python3 -m pip install --upgrade pip

# Pull the Docker image with CUDA 11.8.
# Use `--ipc=host` to make sure the shared memory is large enough.
# docker run --gpus all -it --rm --ipc=host nvcr.io/nvidia/pytorch:22.12-py3


# WORKDIR /vllm
# RUN    pip install -e .  

# USER root

# Install tools.
# ENV DEBIAN_FRONTEND=noninteractive
# RUN apt-get update
# RUN apt-get install -y --no-install-recommends apt-utils
# RUN apt-get install -y --no-install-recommends curl
# RUN apt-get install -y --no-install-recommends wget
# RUN apt-get install -y --no-install-recommends git
# RUN apt-get install -y --no-install-recommends jq
# RUN apt-get install -y --no-install-recommends gnupg

# Install libraries.
# ENV PIP_ROOT_USER_ACTION=ignore


RUN pip install vllm

# transformers with Mistral-7B-v0.1 support
RUN pip3 install git+https://github.com/huggingface/transformers.git@72958fcd3c98a7afdc61f953aa58c544ebda2f79
# autoAWQ with Mistral support (Compute Capability 7.5, CUDA Toolkit 11.8 and later.)
RUN pip3 install git+https://github.com/casper-hansen/AutoAWQ.git@1c5ccc791fa2cb0697db3b4070df1813f1736208


COPY ./run.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/run.sh 
ENTRYPOINT ["/bin/bash", "/usr/local/bin/run.sh", "mistralai/Mistral-7B-Instruct-v0.1-AWQ"]
