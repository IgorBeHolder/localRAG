# the source: https://github.com/GoogleCloudPlatform/vertex-ai-samples/blob/main/community-content/vertex_vision_model_garden/model_oss/vllm/dockerfile/serve.Dockerfile
# Dockerfile for vLLM serving.
#
# To build:
# docker build -f model_oss/vllm/dockerfile/serve.Dockerfile . -t ${YOUR_IMAGE_TAG}
#
# To push to gcr:
# docker tag ${YOUR_IMAGE_TAG} gcr.io/{YOUR_PROJECT}/${YOUR_IMAGE_TAG}
# docker push gcr.io/{YOUR_PROJECT}/${YOUR_IMAGE_TAG}

# The base image is required by vllm
# https://vllm.readthedocs.io/en/latest/getting_started/installation.html
FROM nvcr.io/nvidia/pytorch:22.12-py3

USER root

# Install tools.
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update
RUN apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y --no-install-recommends curl
RUN apt-get install -y --no-install-recommends wget
RUN apt-get install -y --no-install-recommends git
RUN apt-get install -y --no-install-recommends jq
RUN apt-get install -y --no-install-recommends gnupg

# Install libraries.
ENV PIP_ROOT_USER_ACTION=ignore
RUN python3 -m pip install --upgrade pip
# RUN pip install google-cloud-storage==2.7.0
RUN pip install absl-py==1.4.0

# Install pytorch
RUN pip install --upgrade torch==2.0.1

# Install vllm deps.
RUN pip install xformers==0.0.20
RUN pip install ninja==1.11.1
RUN pip install psutil==5.9.5
RUN pip install ray==2.6.2
RUN pip install sentencepiece==0.1.99
RUN pip install fastapi==0.100.1
RUN pip install uvicorn==0.23.2
RUN pip install pydantic==1.10.12

RUN git clone https://github.com/vllm-project/vllm.git
WORKDIR vllm

 # This may take 5-10 minutes.
 RUN pip install -e . 


# Install Python packages and support for the Mistral-7B-Instruct-v0.1-AWQ model from HuggingFace and AutoAWQ

# RUN pip install git+https://github.com/huggingface/transformers.git@72958fcd3c98a7afdc61f953aa58c544ebda2f79 
# RUN pip install git+https://github.com/casper-hansen/AutoAWQ.git@1c5ccc791fa2cb0697db3b4070df1813f1736208

# Copy the run script and set permissions
COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh

# Set the entry point
ENTRYPOINT ["/usr/local/bin/run.sh"]