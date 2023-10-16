"""Sets the path to the src (app) folder so that the modules can be imported"""
import os
import sys


def add_sys_path(pathlist=[]) -> None:
    """
    Add path to sys.path if it is not there already
    args:
        pathlist: list of paths to add to sys.path
        By default, it adds the path one level above this file
    """
    # folder one level above this file
    app_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    # pathlist += [app_folder.join] if app_folder not in pathlist else []

    for path_name in pathlist:
        if path_name not in sys.path:
            folder_to_ad = os.path.abspath(os.path.join(app_folder, path_name))
            sys.path.append(folder_to_ad)


if __name__ == "__main__":
    pathlist = ["app"]
    add_sys_path(pathlist)
    # remove_sys_path(path_list)
    for path in sys.path:
        print(path)
