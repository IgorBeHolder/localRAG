#!/bin/bash

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm could not be found"
    exit 1
fi

# Check if the script is run in a Node.js project directory
if [ ! -f package.json ]; then
    echo "This script must be run in a Node.js project directory (where package.json is located)"
    exit 1
fi

# Output file
output_file="dependencies_sizes.txt"

# Create or clear the output file
> "$output_file"

# List dependencies and devDependencies from package.json
dependencies=$(npm ls --prod --parseable --depth=0 2>/dev/null | sed '1d')
devDependencies=$(npm ls --dev --parseable --depth=0 2>/dev/null | sed '1d')

# Function to calculate size of a directory
calculate_size() {
    du -s "$1" 2>/dev/null | cut -f1
}

# Function to list dependencies and their sizes
list_dependencies() {
    local deps="$1"
    local depType="$2"
    local -a depNames
    local -a depSizes
    echo "$depType:" >> "$output_file"
    for dep in $deps; do
        depNames+=("$(basename "$dep")")
        depSizes+=("$(calculate_size "$dep")")
    done

    # Sort by size in descending order
    for ((i=0; i<${#depSizes[@]}; i++)); do
        for ((j=i+1; j<${#depSizes[@]}; j++)); do
            if [ ${depSizes[i]} -lt ${depSizes[j]} ]; then
                # Swap
                temp=${depSizes[i]}
                depSizes[i]=${depSizes[j]}
                depSizes[j]=$temp

                temp=${depNames[i]}
                depNames[i]=${depNames[j]}
                depNames[j]=$temp
            fi
        done
    done

    # Print to file
    for i in "${!depNames[@]}"; do
        echo "${depNames[i]}: ${depSizes[i]}K" >> "$output_file"
    done
    echo "" >> "$output_file"
}

# List dependencies and their sizes
list_dependencies "$dependencies" "Dependencies"
list_dependencies "$devDependencies" "DevDependencies"

echo "Dependencies and their sizes have been listed (and sorted by size in descending order) in $output_file"
