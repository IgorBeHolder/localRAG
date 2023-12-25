import os
from flask import Flask, json, request, jsonify
from scripts.watch.process_single import process_single
from scripts.watch.filetypes import ACCEPTED_MIMES
import logging
from dotenv import load_dotenv
load_dotenv()
import sys
from flask_cors import CORS






logging.basicConfig(level=logging.INFO)



api = Flask(__name__)
# CORS(api, resources={r"/save_csv": {"origins": "http://194.135.112.219:3001"}})
CORS(api, resources={r"/save_csv": {"origins": "http://localhost:3001"}})
logging.basicConfig(level=logging.INFO)
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
    api.logger.info("Received request to /save_csv")

    if "file" not in request.files:
        api.logger.error("No file part in the request")
        return jsonify({"message": "No file part in the request"}), 400

    file = request.files["file"]
    file_path = os.path.join(DEST_DIRECTORY, file.filename)

    api.logger.info(f"Received file: {file.filename}")

    if file.filename == "":
        api.logger.error("No file selected")
        return jsonify({"message": "Файл не выбран"}), 400

    if file and file.filename.endswith(".csv"):
        api.logger.info(f"File is a CSV: {file.filename}")

        if not os.path.exists(DEST_DIRECTORY):
            try:
                os.makedirs(DEST_DIRECTORY)
                api.logger.info(f"Created directory: {DEST_DIRECTORY}")
            except Exception as e:
                api.logger.error(f"Error creating directory: {e}")
                return jsonify({"message": "Internal Server Error"}), 500

        try:
            file.save(file_path)
            api.logger.info(f"File saved successfully: {file_path}")
            return jsonify({"message": f"Файл {file.filename} успешно загружен"}), 200
        except Exception as e:
            api.logger.error(f"Error saving file: {e}")
            return jsonify({"message": "Internal Server Error"}), 500

    api.logger.error(f"Unsupported file type: {file.filename}")
    return jsonify({"message": "Тип файла не поддерживается"}), 400
