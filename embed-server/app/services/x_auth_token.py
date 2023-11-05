"""Fast API X-ACCESS-TOKEN authentication"""
import os

from fastapi import HTTPException, Request, Security
from fastapi.security import APIKeyHeader
from starlette.status import HTTP_403_FORBIDDEN

from .app_settings import AppSettings

settings = AppSettings()

# settings = AppSettings()
x_api_key_header = APIKeyHeader(name="X_API_TOKEN")


async def get_x_token_key(
    api_key_header: str = Security(x_api_key_header),
):
    """Get X-ACCESS-TOKEN from header."""
    if api_key_header == settings.X_API_TOKEN.get_secret_value():
        return api_key_header

    raise HTTPException(
        status_code=HTTP_403_FORBIDDEN, detail="Could not validate API KEY"
    )


# on-endpoint usage
def authenticate_token(token: str) -> bool:
    EMBED_AUTH_TOKEN = os.getenv("EMBED_AUTH_TOKEN")
    return token == EMBED_AUTH_TOKEN


def get_current_user(request: Request):
    token = request.headers.get("Authorization")
    if token and token.startswith("Bearer "):
        token = token.split(" ")[1]
        if authenticate_token(token):
            return token
    raise HTTPException(status_code=401, detail="Invalid token or token expired")
