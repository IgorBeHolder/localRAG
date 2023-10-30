
### 1. Save the Docker Image as a TAR File

First, on the server where the Docker container is running, you need to save the Docker image as a TAR file. 

```sh
docker save -o <output-path-and-filename.tar> <image-name>

docker save -o ./localRAG/anyth.tar anyth:v1
docker save -o ./localRAG/nginx.tar nginx:latest
docker save -o ./localRAG/embed.tar embed:v1
docker save -o ./localRAG/vllm.tar vllm:v1
docker save -o ./localRAG/llama.tar llama:v1
```

- `<output-path-and-filename.tar>`: The path and name of the TAR file you want to create.
- `<image-name>`: The name of the Docker image you want to save.

### 2. Transfer the TAR File to the Client Host Machine

Next, you need to transfer the TAR file to the client host machine. This can be done using a USB drive, a CD/DVD, or any other appropriate transfer method. 

### 3. Load the Docker Image on the Client Host Machine

Once the TAR file is on the client host machine, you can load the Docker image from the TAR file:

```sh
docker load -i <path-to-tar-file>

docker load -i ./localRAG/anyth.tar
docker load -i ./localRAG/nginx.tar
docker load -i ./localRAG/embed.tar
docker load -i ./localRAG/vllm.tar
docker load -i ./localRAG/llama.tar
```

- `<path-to-tar-file>`: The path to the TAR file on the client host machine.

### 4. Run the Docker Container

After loading the image, you can run the Docker container as usual:

```sh
docker run <options> <image-name>
```

### 5. Install Docker on the Client Host Machine (If Not Already Installed)

Note that Docker needs to be installed on the client host machine to perform these operations. If Docker is not installed and the machine does not have internet access, you will need to download the Docker installation files from another machine that has internet access, transfer them to the client host machine, and then install Docker.

For a machine running a Debian-based OS, you would download the `.deb` installation files. For Red Hat-based OS, you would download the `.rpm` files. The exact steps depend on the operating system of the client host machine.

By following these steps, you can transfer a Docker image from a server to a client host machine without needing internet access on the client host machine.