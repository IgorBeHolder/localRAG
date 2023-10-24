FROM nvcr.io/nvidia/pytorch:22.12-py3

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
RUN python3 -m pip install --upgrade pip

RUN pip install vllm

# Copy docker helper scripts
COPY ./run.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/run.sh 
ENTRYPOINT ["/bin/bash", "/usr/local/bin/run.sh", "mistralai/Mistral-7B-Instruct-v0.1-AWQ"]
