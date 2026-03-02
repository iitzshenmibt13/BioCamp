"""Auth router: LINE LIFF token exchange -> JWT."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.database import get_db
from app.models import User, RoleEnum
from app.auth.line import verify_liff_id_token
from app.auth.jwt import create_access_token
from app.auth.middleware import get_current_user

router = APIRouter()


class LineAuthRequest(BaseModel):
    idToken: str


class AuthResponse(BaseModel):
    jwt: str
    user: dict
    role: str
    group_id: str | None


@router.post("/line", response_model=AuthResponse)
async def auth_with_line(body: LineAuthRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a LINE LIFF idToken for a Camp Ops JWT."""
    try:
        payload = await verify_liff_id_token(body.idToken)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    line_user_id = payload.get("sub")
    if not line_user_id:
        raise HTTPException(status_code=401, detail="Invalid token: missing sub")

    # Upsert user
    result = await db.execute(select(User).where(User.line_user_id == line_user_id))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            line_user_id=line_user_id,
            display_name=payload.get("name", ""),
            picture_url=payload.get("picture"),
            role=RoleEnum.camper,
        )
        db.add(user)
    else:
        user.display_name = payload.get("name", user.display_name)
        user.picture_url = payload.get("picture", user.picture_url)
        user.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id, user.role.value, user.group_id)
    return AuthResponse(
        jwt=token,
        user={"id": user.id, "display_name": user.display_name, "picture_url": user.picture_url},
        role=user.role.value,
        group_id=user.group_id,
    )


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "line_user_id": current_user.line_user_id,
        "display_name": current_user.display_name,
        "picture_url": current_user.picture_url,
        "role": current_user.role.value,
        "group_id": current_user.group_id,
    }
