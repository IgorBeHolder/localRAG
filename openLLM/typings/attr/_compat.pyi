import threading

from typing import Any

def set_closure_cell(cell: Any, value: Any) -> None: ...

repr_context: threading.local = ...
