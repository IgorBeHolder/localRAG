FROM postgres:latest

# Install the required packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        build-essential \
        ca-certificates \
        postgresql-server-dev-all \
    && git clone https://github.com/neondatabase/pg_embedding.git \
    && cd pg_embedding \
    && make \
    && make install \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy your init-extension.sql script into the container
COPY init-extension.sql /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432

# Set the default command to run when starting the container
CMD ["postgres"]



# docker build -t pgembeding .
# cd ..
# docker-compose -p localrag up -d --build

