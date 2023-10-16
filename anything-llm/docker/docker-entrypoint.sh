#!/bin/bash
node /app/server/index.js &
{ FLASK_ENV=production FLASK_APP=wsgi.py cd collector && gunicorn --timeout 300 --workers 4 --bind localhost:3005 wsgi:api; } &
wait -n
exit $?
