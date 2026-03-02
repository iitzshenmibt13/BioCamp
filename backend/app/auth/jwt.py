"""JWT creation and verification."""
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt, JWTError
from app.config import settings

ALGORITHM = "HS256"


def create_access_token(user_id: str, role: str, group_id: Optional[str] = None) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.jwt_expire_hours)
    payload = {
        "sub": user_id,
        "role": role,
        "group_id": group_id,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")
