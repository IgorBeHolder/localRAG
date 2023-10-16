"""Module for load common app settings form `.env`"""
from functools import lru_cache

from dotenv import find_dotenv, load_dotenv
# from pydantic.types import PositiveInt
from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings

load_dotenv(find_dotenv('.env'))


class _AppSettings(BaseSettings):
    class Config:
        """Configuration of settings."""

        env_file_encoding = "utf-8"
        arbitrary_types_allowed = True


class AppSettings(_AppSettings):
    """Server settings.  Formed from `.env` file."""

    X_API_TOKEN: SecretStr = Field(" ", env="X_API_TOKEN")
    X_ACCESS_TOKEN: SecretStr = Field(" ", env="X_ACCESS_TOKEN")

    # TELEGRAM_LEVEL: PositiveInt = Field(1, env="TELEGRAM_LEVEL")
    # TELEGRAM_CHAT_ID: str = Field(" ", env="TELEGRAM_CHAT_ID")
    # TELEGRAM_DSBOT_TOKEN: SecretStr = Field(" ", env="TELEGRAM_DSBOT_TOKEN")
    # TELEGRAM_BOT_TOKEN: SecretStr = Field(" ", env="TELEGRAM_BOT_TOKEN")


@lru_cache
def get_settings(env_file: str = ".env"):
    """Create settings instance."""
    _file = find_dotenv(env_file)
    return AppSettings(_env_file=_file)
