# Use an official Python runtime as a parent image
FROM python:3.8-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install PyTorch
RUN pip install torch

# Install the transformers library
RUN pip install transformers

# Copy the current directory contents into the container at /usr/src/app
COPY . /usr/src/app

# Run download_model.py when the container launches
CMD ["python", "./download_model.py"]

