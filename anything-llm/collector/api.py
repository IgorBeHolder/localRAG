import os
from flask import Flask, json, request, jsonify
from scripts.watch.process_single import process_single
from scripts.watch.filetypes import ACCEPTED_MIMES
import logging
from dotenv import load_dotenv
load_dotenv()
import sys




logging.basicConfig(level=logging.INFO)



api = Flask(__name__)

api.logger.addHandler(logging.StreamHandler(sys.stdout))
api.logger.setLevel(logging.INFO)

WATCH_DIRECTORY = "hotdir"


@api.route("/process", methods=["POST"])
def process_file():
    content = request.json
    target_filename = os.path.normpath(content.get("filename")).lstrip(
        os.pardir + os.sep
    )
    print(f"Processing {target_filename}")
    success, reason = process_single(WATCH_DIRECTORY, target_filename)
    return json.dumps(
        {"filename": target_filename, "success": success, "reason": reason}
    )


@api.route("/accepts", methods=["GET"])
def get_accepted_filetypes():
    return json.dumps(ACCEPTED_MIMES)


@api.route("/", methods=["GET"])
def root():
    return "<p>Use POST /process with filename key in JSON body in order to process a file. File by that name must exist in hotdir already.</p>"


# read DEST_DIRECTORY from .env file
# DEST_DIRECTORY = os.getenv("CODER_DIR")


DEST_DIRECTORY = "./server/storage/coder"


@api.route("/save_csv", methods=["POST"])
def save_csv_file():
    # Check if the post request has the file part

    if "file" not in request.files:
        return jsonify({"message": "No file part in the request"}), 400

    file = request.files["file"]
    print(f"Received a request to save {os.path.join(DEST_DIRECTORY, file.filename)} file!.")
    # If the user does not select a file, the browser submits an
    # empty file without a filename.
    api.logger.info(f"Received a request to save {os.path.join(DEST_DIRECTORY, file.filename)} file!.")
    if file.filename == "":
        return jsonify({"message": "Файл не выбран"}), 400

    if file and file.filename.endswith(".csv"):
        # Ensure destination directory exists
        if not os.path.exists(DEST_DIRECTORY):
            os.makedirs(DEST_DIRECTORY)



        # Construct the file path
        file_path = os.path.join(DEST_DIRECTORY, file.filename)


        # Save the file
        file.save(file_path)
        return jsonify({"message": f"Файл {file.filename} успешно загружен"}), 200

    return jsonify({"message": "Тип файла не поддерживается"}), 400
