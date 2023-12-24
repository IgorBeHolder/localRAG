#!/bin/bash

node /app/server/index.js &

# Set the bind address based on MODE
echo "*************************************$MODE"


BIND_ADDRESS=localhost:3005

# Start Python Flask server
export FLASK_ENV=production
export FLASK_APP=wsgi.py
cd collector && gunicorn --timeout 300 --workers 4 --bind $BIND_ADDRESS wsgi:api &

# Wait for any of the background jobs to exit
wait -n

# Exit with the status of the last command that exited
exit $?
