# Setup base image
FROM ubuntu:jammy-20230522 AS base

# Build arguments
ARG ARG_UID
ARG ARG_GID

# Install sudo and system dependencies
RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends \
        sudo curl libgfortran5 python3 python3-pip tzdata netcat make\
        libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 \
        libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libx11-6 libx11-xcb1 libxcb1 \
        libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
        libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release \
        xdg-utils && \
    apt-get update && \
    apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    NODE_MAJOR=20 && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install nodejs -y && \
    curl -LO https://github.com/yarnpkg/yarn/releases/download/v1.22.19/yarn_1.22.19_all.deb && dpkg -i yarn_1.22.19_all.deb && rm yarn_1.22.19_all.deb && \
    curl -LO https://github.com/jgm/pandoc/releases/download/3.1.3/pandoc-3.1.3-1-amd64.deb && dpkg -i pandoc-3.1.3-1-amd64.deb && rm pandoc-3.1.3-1-amd64.deb && \
    rm -rf /var/lib/apt/lists/* /usr/share/icons && \
    dpkg-reconfigure -f noninteractive tzdata && \
    python3 -m pip install --no-cache-dir virtualenv

# Create a group and user with specific UID and GID
RUN groupadd -g $ARG_GID anythingllm && \
    useradd -u $ARG_UID -m -d /app -s /bin/bash -g anythingllm anythingllm && \
    mkdir -p /app/frontend/ /app/server/ /app/collector/ && chown -R anythingllm:anythingllm /app

# Copy docker helper scripts
COPY ./docker/docker-entrypoint.sh /usr/local/bin/
COPY ./docker/docker-healthcheck.sh /usr/local/bin/

# Ensure the scripts are executable
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-healthcheck.sh

USER anythingllm

WORKDIR /app

# Install frontend dependencies
FROM base as frontend-deps

COPY --chown=anythingllm:anythingllm ./frontend/package.json ./frontend/yarn.lock ./frontend/


RUN  --mount=type=cache,target=/tmp/yarn-cache cd ./frontend/ && \
    yarn install && yarn cache clean

# Install server dependencies
FROM base as server-deps

COPY --chown=anythingllm:anythingllm ./server/package.json ./server/yarn.lock ./server/

RUN  --mount=type=cache,target=/tmp/yarn-cache cd ./server/ && \
    yarn install --production && yarn cache clean

RUN if [ -f "/app/server/node_modules/vectordb/x86_64-apple-darwin.node" ]; then rm "/app/server/node_modules/vectordb/x86_64-apple-darwin.node"; fi
RUN if [ -f "/app/server/node_modules/vectordb/aarch64-apple-darwin.node" ]; then rm "/app/server/node_modules/vectordb/aarch64-apple-darwin.node"; fi

# Build the frontend
FROM frontend-deps as build-stage
# to avoid permission errors with bundleinspector.html
COPY --chown=anythingllm:anythingllm ./frontend/ ./frontend/


RUN --mount=type=cache,target=/tmp/yarn-cache cd ./frontend/ && \
    yarn build && yarn cache clean && \
    rm -rf /tmp/yarn-cache/*

# Setup the server
FROM server-deps as production-stage
COPY --chown=anythingllm:anythingllm ./server/ ./server/

# Copy built static frontend files to the server public directory
COPY --from=build-stage /app/frontend/dist ./server/public

# Copy the collector
COPY --chown=anythingllm:anythingllm ./collector/ ./collector/

# Install collector dependencies
RUN --mount=type=cache,target=/tmp/pip_cache cd /app/collector && \
    python3 -m virtualenv v-env && \
    . v-env/bin/activate && \
    pip install -r req.txt && \
    rm -rf /tmp/pip_cache/*


# Migrate and Run Prisma against known schema
# RUN cd ./server && npx prisma generate && npx prisma migrate && npx prisma seed
RUN cd ./server && npx prisma generate --schema=./prisma/schema.prisma
RUN cd ./server && npx prisma migrate deploy --schema=./prisma/schema.prisma

# Setup the environment
ENV NODE_ENV=production
ENV PATH=/app/collector/v-env/bin:$PATH

# Setup the healthcheck
HEALTHCHECK --interval=1m --timeout=10s --start-period=1m \
  CMD /bin/bash /usr/local/bin/docker-healthcheck.sh || exit 1

COPY --chown=anythingllm:anythingllm ./server/storage/coder ./server/storage/coder/
RUN chmod -R 777 ./server/storage/coder/

# Run the server
ENTRYPOINT ["/bin/bash", "/usr/local/bin/docker-entrypoint.sh"]
