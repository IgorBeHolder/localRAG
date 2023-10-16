from typing import List
from typing import Literal
from typing import Tuple

from .merger import Merger

DEFAULT_TYPE_SPECIFIC_MERGE_STRATEGIES: List[Tuple[type, Literal['append', 'merge', 'union']]] = ...
always_merger: Merger = ...
merge_or_raise: Merger = ...
conservative_merger: Merger = ...
