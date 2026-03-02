"""
LINE LIFF idToken verification.
Calls LINE's verify endpoint to validate an LIFF idToken.
"""
import httpx
from app.config import settings


LINE_VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify"


async def verify_liff_id_token(id_token: str, user_agent: str = "") -> dict:
    """
    Verify a LINE LIFF idToken against the LINE API.
    Returns decoded token payload or raises ValueError.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            LINE_VERIFY_URL,
            data={
                "id_token": id_token,
                "client_id": settings.line_login_channel_id,
            },
        )
    if resp.status_code != 200:
        raise ValueError(f"LINE token verification failed: {resp.text}")
    data = resp.json()
    if "error" in data:
        raise ValueError(f"LINE token error: {data.get('error_description', data['error'])}")
    return data
