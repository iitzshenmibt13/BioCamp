"""Groups router."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.database import get_db
from app.models import Group, User, RoleEnum, PointTransaction
from app.auth.middleware import get_current_user, require_admin, require_staff

router = APIRouter()


class GroupCreate(BaseModel):
    name: str
    color: str = "#4CAF50"
    join_code: Optional[str] = None


class JoinGroupRequest(BaseModel):
    join_code: str


@router.get("")
async def list_groups(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Group))
    groups = result.scalars().all()
    out = []
    for g in groups:
        pts_result = await db.execute(
            select(func.coalesce(func.sum(PointTransaction.delta_points), 0))
            .where(PointTransaction.group_id == g.id)
            .where(PointTransaction.is_reversed == False)
        )
        total = pts_result.scalar() or 0
        out.append({"id": g.id, "name": g.name, "color": g.color, "join_code": g.join_code, "total_points": total})
    return out


@router.post("")
async def create_group(
    body: GroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    group = Group(name=body.name, color=body.color, join_code=body.join_code)
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return group


@router.post("/join")
async def join_group(
    body: JoinGroupRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Group).where(Group.join_code == body.join_code))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Invalid join code")
    current_user.group_id = group.id
    await db.commit()
    return {"message": f"Joined group {group.name}", "group_id": group.id}


@router.patch("/{group_id}/assign-user/{user_id}")
async def assign_user_to_group(
    group_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    target.group_id = group_id
    await db.commit()
    return {"message": "User assigned"}


@router.patch("/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        target.role = RoleEnum(role)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role")
    await db.commit()
    return {"message": "Role updated"}
