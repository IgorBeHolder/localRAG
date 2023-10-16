# Stage 1: Builder stage
FROM python:3.11-slim

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install -r requirements.txt && 

COPY ./app ./app

CMD ["python", "app/bootstrap.py"]
