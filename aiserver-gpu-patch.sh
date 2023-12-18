#!/bin/bash
set -e

tarball_name="ais-openchat_pat"
container_names=("anyth" "nginx")
images_to_save=()

for container_name in "${container_names[@]}"; do
    container_id=$(docker ps -qf "name=$container_name")
    # Check if the container ID was found
    if [ -z "$container_id" ]; then
        echo "Error: No container found with name $container_name"
        continue 
    fi

    echo "Committing the container ($container_name) to a new image..."
    docker commit "$container_id" "${container_name}:last_com"

    images_to_save+=("${container_name}:last_com")
done

# images_to_save+=("nginx:v1")

echo "Saving docker images to a tarball..."
docker save -o "$tarball_name.tar" "${images_to_save[@]}"
echo "Docker images saved to a tarball."



echo "Compressing tarball..."
tar -czvf "$tarball_name.tar.gz" \
"$tarball_name.tar" \
./vllm/docker/docker-compose.yml \
./embed-server/config/ \
./db-reset.sh \
./client-files/


echo "Tarball compressed."

rm "$tarball_name.tar"

# Generate MD5 checksum and save to a file
md5sum "$tarball_name.tar.gz" > "md5sum_$tarball_name.txt"
touch "md5sum_$tarball_name.txt"
echo "md5sum saved to md5sum_$tarball_name.txt"

echo "Script completed successfully."