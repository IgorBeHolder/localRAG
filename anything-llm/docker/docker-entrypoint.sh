#!/bin/bash

# Load environment variables from .env file
set -a  # automatically export all variables
source .env
set +a

node /app/server/index.js &

if [ "$MODE" = "production" ]; then
  BIND_ADDRESS="localhost:3005"
else
  BIND_ADDRESS="0.0.0.0:3005"
fi

{ FLASK_ENV=production FLASK_APP=wsgi.py cd collector && gunicorn --timeout 300 --workers 4 --bind $BIND_ADDRESS wsgi:api; } &

wait -n
exit $?
