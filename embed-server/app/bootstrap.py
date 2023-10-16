from services.path_utils import add_sys_path

# Modify the sys.path first
add_sys_path([""])  # , "models", "services", "api", ""])

# Now that the path is modified, import and run your main application
from app.main import run

if __name__ == "__main__":
    run()
