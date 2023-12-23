# Start with the official Python 3.11.3 image
FROM python:3.11.3

# Update and install dependencies for SSH server and any additional system libraries
RUN apt-get update && apt-get install -y \
    openssh-server \
    build-essential \
    libffi-dev \
    libssl-dev \
    zlib1g-dev \
    liblzma-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    wget \
    curl \
    llvm \
    libncurses5-dev \
    libncursesw5-dev \
    xz-utils \
    tk-dev

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
# Add Poetry to PATH
ENV PATH="/root/.local/bin:$PATH"

# Set Poetry configuration to not create a virtual environment inside the Docker container
ENV POETRY_VIRTUALENVS_CREATE=false

# Copy your 'pyproject.toml' and 'poetry.lock' files into the Docker image
COPY pyproject.toml poetry.lock* /home/

# Install Python dependencies
WORKDIR /home
RUN poetry install --no-dev

RUN pip3 install --upgrade pip

RUN --mount=type=cache,target=/tmp/pip_cache pip3 install \
    matplotlib seaborn openpyxl \
    sweetviz open-interpreter websockets

    # pydantic==2.4.0 pandas-profiling
    # dataprep scikit-learn
# RUN --mount=type=cache,target=/tmp/pip_cache pip3 install


# Create SSH directory
RUN mkdir /var/run/sshd
# Set up a user for SSH
RUN useradd -rm -d /home/coder -s /bin/bash -g root -G sudo -u 1001 coder
# Replace 'your_password' with a secure password
RUN echo 'coder:coder' | chpasswd
RUN chown -R coder:root /home

# SSH login fix. Otherwise, the user is kicked off after login
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

EXPOSE 22

EXPOSE 3006

RUN mkdir /home/content
COPY interpreter/terminal_interface/config.yaml \
    /usr/local/lib/python3.11/site-packages/interpreter/terminal_interface/config.yaml

COPY interpreter/terminal_interface/terminal_interface.py \
    /usr/local/lib/python3.11/site-packages/interpreter/terminal_interface/terminal_interface.py

COPY interpreter/core/llm/setup_openai_coding_llm.py \
    /usr/local/lib/python3.11/site-packages/interpreter/core/llm/setup_openai_coding_llm.py

COPY interpreter/core/llm/convert_to_coding_llm.py \
    /usr/local/lib/python3.11/site-packages/interpreter/core/llm/convert_to_coding_llm.py


    # RUN echo "interpreter && %reset" >> /home/coder/.bashrc

# Start the SSH service
CMD ["/usr/sbin/sshd", "-D"]

