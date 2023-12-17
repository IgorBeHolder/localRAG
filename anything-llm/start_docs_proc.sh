#!/bin/bash

# script to run document processor in development mode
source ./collector/venv/bin/activate
node ./server/index.js &
{ FLASK_ENV=production FLASK_APP=wsgi.py cd ./collector && gunicorn --timeout 300 --workers 4 --bind 0.0.0.0:3005 wsgi:api; } &
# wait -n
exit $?