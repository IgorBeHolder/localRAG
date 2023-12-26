#!/bin/bash
set -e

tarball_name="sais-openchat-cpu"
container_names=("anyth" "nginx" "coder")
images_to_save=()

for container_name in "${container_names[@]}"; do
    container_id=$(docker ps -qaf "name=$container_name")
    # Check if the container ID was found
    if [ -z "$container_id" ]; then
        echo "Error: No container found with name $container_name"
        continue 
    fi

    echo "Committing the container ($container_name) to a new image..."
    docker commit "$container_id" "${container_name}:last_com"

    images_to_save+=("${container_name}:last_com")
done

images_to_save+=("llm-server:v2" "pgembeding:latest" "embed:v1" )

echo "Saving docker images to a tarball..."
docker save -o "$tarball_name.tar" "${images_to_save[@]}"
echo "Docker images saved to a tarball."



echo "Compressing tarball..."
tar -czvf "$tarball_name.tar.gz" \
"$tarball_name.tar" \
./embed-server/config/ \
./db-reset.sh \
./client-files/


echo "Tarball compressed."

rm "$tarball_name.tar"

# Generate MD5 checksum and save to a file
md5sum "$tarball_name.tar.gz" > "md5sum_$tarball_name.tar.gz.txt"

# Display the contents of the MD5 checksum file
echo "Displaying the MD5 checksum:"
cat "md5sum_$tarball_name.tar.gz.txt"

echo "Script completed successfully."