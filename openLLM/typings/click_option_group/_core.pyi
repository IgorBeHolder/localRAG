import sys

from typing import Any
from typing import Callable
from typing import Dict
from typing import List
from typing import Mapping
from typing import Optional
from typing import Sequence
from typing import Set
from typing import Tuple
from typing import TypeVar
from typing import Union

import click

if sys.version_info[:2] >= (3, 10):
  from typing import TypeAlias
else:
  from typing_extensions import TypeAlias

AnyCallable: TypeAlias = Callable[..., Any]
_FC = TypeVar('_FC', bound=Union[AnyCallable, click.Command])

class GroupedOption(click.Option):
    def __init__(self, param_decls: Optional[Sequence[str]] = ..., *, group: OptionGroup, **attrs: Any) -> None: ...
    @property
    def group(self) -> OptionGroup: ...
    def handle_parse_result(
        self, ctx: click.Context, opts: Mapping[str, Any], args: List[str]
    ) -> Tuple[Any, List[str]]: ...
    def get_help_record(self, ctx: click.Context) -> Optional[Tuple[str, str]]: ...

class _GroupTitleFakeOption(click.Option):
    def __init__(self, param_decls: Optional[Sequence[str]] = ..., *, group: OptionGroup, **attrs: Any) -> None: ...
    def get_help_record(self, ctx: click.Context) -> Optional[Tuple[str, str]]: ...

class OptionGroup:
    def __init__(self, name: Optional[str] = ..., *, hidden: bool = ..., help: Optional[str] = ...) -> None: ...
    @property
    def name(self) -> str: ...
    @property
    def help(self) -> str: ...
    @property
    def name_extra(self) -> List[str]: ...
    @property
    def forbidden_option_attrs(self) -> List[str]: ...
    def get_help_record(self, ctx: click.Context) -> Optional[Tuple[str, str]]: ...
    def option(self, *param_decls: Any, **attrs: Any) -> Callable[[_FC], _FC]: ...
    def get_options(self, ctx: click.Context) -> Dict[str, GroupedOption]: ...
    def get_option_names(self, ctx: click.Context) -> List[str]: ...
    def get_error_hint(self, ctx: click.Context, option_names: Optional[Set[str]] = ...) -> str: ...
    def handle_parse_result(self, option: GroupedOption, ctx: click.Context, opts: Mapping[str, Any]) -> None: ...

class RequiredAnyOptionGroup(OptionGroup):
    @property
    def forbidden_option_attrs(self) -> List[str]: ...
    @property
    def name_extra(self) -> List[str]: ...
    def handle_parse_result(self, option: GroupedOption, ctx: click.Context, opts: Mapping[str, Any]) -> None: ...

class RequiredAllOptionGroup(OptionGroup):
    @property
    def forbidden_option_attrs(self) -> List[str]: ...
    @property
    def name_extra(self) -> List[str]: ...
    def handle_parse_result(self, option: GroupedOption, ctx: click.Context, opts: Mapping[str, Any]) -> None: ...

class MutuallyExclusiveOptionGroup(OptionGroup):
    @property
    def forbidden_option_attrs(self) -> List[str]: ...
    @property
    def name_extra(self) -> List[str]: ...
    def handle_parse_result(self, option: GroupedOption, ctx: click.Context, opts: Mapping[str, Any]) -> None: ...

class RequiredMutuallyExclusiveOptionGroup(MutuallyExclusiveOptionGroup):
    @property
    def name_extra(self) -> List[str]: ...
    def handle_parse_result(self, option: GroupedOption, ctx: click.Context, opts: Mapping[str, Any]) -> None: ...

class AllOptionGroup(OptionGroup):
    @property
    def forbidden_option_attrs(self) -> List[str]: ...
    @property
    def name_extra(self) -> List[str]: ...
    def handle_parse_result(self, option: GroupedOption, ctx: click.Context, opts: Mapping[str, Any]) -> None: ...
