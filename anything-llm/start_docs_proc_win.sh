#!/bin/bash

# script to run document processor in development mode
collector/venv/scripts/activate
# cd ..
# { set FLASK_ENV = "production" && set FLASK_APP="wsgi.py" && cd ./collector && flask run --host=0.0.0.0 --port=3005; }
{ set FLASK_ENV = "development" && set FLASK_APP="wsgi.py" && cd ./collector && flask run --host=0.0.0.0 --port=3005; }
# wait -n
# exit $?
