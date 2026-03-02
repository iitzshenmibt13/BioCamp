"""Announcements router."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import Announcement, User, AnnouncementTargetEnum, RoleEnum
from app.auth.middleware import get_current_user, require_staff
from app.ws.manager import ws_manager

router = APIRouter()


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    target: AnnouncementTargetEnum = AnnouncementTargetEnum.all
    target_group_id: Optional[str] = None
    is_pinned: bool = False


@router.get("")
async def list_announcements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Announcement).order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc())
    result = await db.execute(query)
    items = result.scalars().all()
    visible = []
    for a in items:
        if current_user.role in (RoleEnum.staff, RoleEnum.admin):
            visible.append(a)
        elif a.target == AnnouncementTargetEnum.all:
            visible.append(a)
        elif a.target == AnnouncementTargetEnum.group and a.target_group_id == current_user.group_id:
            visible.append(a)
    return [
        {
            "id": a.id, "title": a.title, "content": a.content,
            "target": a.target.value, "target_group_id": a.target_group_id,
            "is_pinned": a.is_pinned, "created_at": a.created_at.isoformat(),
        }
        for a in visible
    ]


@router.post("")
async def create_announcement(
    body: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    a = Announcement(**body.model_dump(), created_by=current_user.id)
    db.add(a)
    await db.commit()
    await db.refresh(a)
    await ws_manager.broadcast({"type": "announcement_created", "title": a.title})
    return {"id": a.id, "title": a.title}


@router.patch("/{item_id}/pin")
async def pin_announcement(
    item_id: str,
    pinned: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(select(Announcement).where(Announcement.id == item_id))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(404, "Not found")
    a.is_pinned = pinned
    await db.commit()
    return {"message": "Updated"}


@router.delete("/{item_id}")
async def delete_announcement(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(select(Announcement).where(Announcement.id == item_id))
    a = result.scalar_one_or_none()
    if not a:
        raise HTTPException(404, "Not found")
    await db.delete(a)
    await db.commit()
    return {"message": "Deleted"}
