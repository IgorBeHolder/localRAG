#!/bin/bash

# Add any additional setup or runtime configuration here

# Start the SSH daemon
/usr/sbin/sshd -D &&

echo "Starting the interpreter" &&
# interpreter
python3 /home/interpreter.py

