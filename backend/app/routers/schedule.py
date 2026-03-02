"""Schedule router."""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import ScheduleItem, User, AuditLog, RoleEnum
from app.auth.middleware import get_current_user, require_staff
from app.ws.manager import ws_manager

router = APIRouter()


class ScheduleItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_at: datetime
    end_at: datetime
    day_index: Optional[int] = None
    location_text: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    maps_url: Optional[str] = None
    is_published: bool = False


class ScheduleItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    day_index: Optional[int] = None
    location_text: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    maps_url: Optional[str] = None
    is_published: Optional[bool] = None


def item_dict(item: ScheduleItem) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "description": item.description,
        "start_at": item.start_at.isoformat() if item.start_at else None,
        "end_at": item.end_at.isoformat() if item.end_at else None,
        "day_index": item.day_index,
        "location_text": item.location_text,
        "location_lat": float(item.location_lat) if item.location_lat else None,
        "location_lng": float(item.location_lng) if item.location_lng else None,
        "maps_url": item.maps_url,
        "is_published": item.is_published,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }


@router.get("")
async def list_schedule(
    from_: Optional[datetime] = Query(None, alias="from"),
    to: Optional[datetime] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(ScheduleItem).order_by(ScheduleItem.start_at)
    if current_user.role == RoleEnum.camper:
        query = query.where(ScheduleItem.is_published == True)
    if from_:
        query = query.where(ScheduleItem.start_at >= from_)
    if to:
        query = query.where(ScheduleItem.end_at <= to)
    result = await db.execute(query)
    return [item_dict(i) for i in result.scalars().all()]


@router.post("")
async def create_schedule_item(
    body: ScheduleItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    item = ScheduleItem(**body.model_dump(), updated_by=current_user.id)
    db.add(item)
    db.add(AuditLog(actor_user_id=current_user.id, action="SCHEDULE_CREATE", entity_type="schedule_item", entity_id="pending", meta={"title": body.title}))
    await db.commit()
    await db.refresh(item)
    if item.is_published:
        await ws_manager.broadcast({"type": "schedule_updated"})
    return item_dict(item)


@router.patch("/{item_id}")
async def update_schedule_item(
    item_id: str,
    body: ScheduleItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(select(ScheduleItem).where(ScheduleItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Schedule item not found")
    update_data = body.model_dump(exclude_none=True)
    for k, v in update_data.items():
        setattr(item, k, v)
    item.updated_by = current_user.id
    item.updated_at = datetime.utcnow()
    db.add(AuditLog(actor_user_id=current_user.id, action="SCHEDULE_UPDATE", entity_type="schedule_item", entity_id=item_id, meta=update_data))
    await db.commit()
    await ws_manager.broadcast({"type": "schedule_updated"})
    return item_dict(item)


@router.post("/{item_id}/publish")
async def publish_schedule_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(select(ScheduleItem).where(ScheduleItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    item.is_published = True
    item.updated_by = current_user.id
    await db.commit()
    await ws_manager.broadcast({"type": "schedule_updated"})
    return {"message": "Published"}


@router.delete("/{item_id}")
async def delete_schedule_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(select(ScheduleItem).where(ScheduleItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
    await ws_manager.broadcast({"type": "schedule_updated"})
    return {"message": "Deleted"}
