from services.path_utils import add_sys_path
from dotenv import load_dotenv

load_dotenv("../../client-files/.env", verbose=True)  # for production
# load_dotenv("./client-files/.env", verbose=True)  # for development

# Modify the sys.path first
add_sys_path([""])  # , "models", "services", "api", ""])


# Now that the path is modified, import and run main application
from app.main import run

if __name__ == "__main__":
    run()
