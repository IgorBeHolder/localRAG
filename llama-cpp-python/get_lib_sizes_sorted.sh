#!/bin/bash

echo "Library, Size"

# Create a temporary file for sorting
tempfile=$(mktemp)

pip list --format freeze | cut -d= -f1 | while read pkg; do
    # Get directory path
    dir_path=$(pip show $pkg | grep "Location: " | cut -d: -f2 | xargs -I{} echo {}/$pkg)
    # Check if directory exists
    if [ -d "$dir_path" ]; then
        # Get size in KB
        size_in_kb=$(du -sk $dir_path | cut -f1)
        # Get size in human-readable format
        human_size=$(du -sh $dir_path | cut -f1)
        echo "$size_in_kb,$pkg,$human_size" >> $tempfile
    fi
done

# Sort by size (in descending order) and display
sort -rn $tempfile | cut -d, -f2,3

# Clean up the temp file
rm $tempfile


# chmod +x get_lib_sizes_sorted.sh 

# run the script as:
# ./get_lib_sizes_sorted.sh > library_sizes_sorted.csv
