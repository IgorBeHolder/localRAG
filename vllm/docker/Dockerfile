FROM python:3.11-slim-bullseye

# Update packages, install essential tools, and clean up in one step to reduce layer size
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip to the latest version
RUN python3 -m pip install --upgrade pip

# Install Python packages and support for the Mistral-7B-Instruct-v0.1-AWQ model from HuggingFace and AutoAWQ
RUN pip install vllm 
# RUN pip install git+https://github.com/huggingface/transformers.git@72958fcd3c98a7afdc61f953aa58c544ebda2f79 
RUN pip install git+https://github.com/casper-hansen/AutoAWQ.git@1c5ccc791fa2cb0697db3b4070df1813f1736208

# Copy the run script and set permissions
COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh

# Set the entry point
ENTRYPOINT ["/usr/local/bin/run.sh"]