"""Simple single-password login using a signed JWT token."""
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .config import settings

security = HTTPBearer(auto_error=False)


def create_token() -> str:
    """Make a signed token that is valid for TOKEN_HOURS."""
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.TOKEN_HOURS)
    payload = {"sub": "owner", "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def check_password(password: str) -> bool:
    return password == settings.APP_PASSWORD


def require_auth(creds: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency: reject the request if there is no valid token."""
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not logged in")
    try:
        jwt.decode(creds.credentials, settings.SECRET_KEY, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    return True
