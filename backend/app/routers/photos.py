"""Photos router."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime

from app.database import get_db
from app.models import Photo, PhotoLike, User, AuditLog, RoleEnum
from app.auth.middleware import get_current_user, require_staff
from app.services.s3 import upload_file
from app.ws.manager import ws_manager

router = APIRouter()


@router.get("")
async def list_photos(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Photo).order_by(Photo.created_at.desc())
    if current_user.role == RoleEnum.camper:
        query = query.where(Photo.is_published == True)
    result = await db.execute(query)
    photos = result.scalars().all()
    out = []
    for p in photos:
        likes_count = await db.execute(select(func.count()).where(PhotoLike.photo_id == p.id))
        liked_by_me_q = await db.execute(select(PhotoLike).where(PhotoLike.photo_id == p.id, PhotoLike.user_id == current_user.id))
        out.append({
            "id": p.id, "url": p.url, "caption": p.caption,
            "is_published": p.is_published, "created_at": p.created_at.isoformat(),
            "likes_count": likes_count.scalar() or 0,
            "liked_by_me": liked_by_me_q.scalar_one_or_none() is not None,
        })
    return out


@router.post("")
async def upload_photo(
    caption: Optional[str] = Form(None),
    taken_at: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    url = await upload_file(file, folder="photos")
    photo = Photo(
        url=url,
        caption=caption,
        taken_at=datetime.fromisoformat(taken_at) if taken_at else None,
        uploaded_by=current_user.id,
        is_published=False,
    )
    db.add(photo)
    db.add(AuditLog(actor_user_id=current_user.id, action="PHOTO_UPLOAD", entity_type="photo", entity_id="pending", meta={"caption": caption}))
    await db.commit()
    await db.refresh(photo)
    return {"id": photo.id, "url": photo.url}


@router.patch("/{photo_id}")
async def update_photo(
    photo_id: str,
    is_published: Optional[bool] = None,
    caption: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(select(Photo).where(Photo.id == photo_id))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(404, "Not found")
    if is_published is not None:
        photo.is_published = is_published
        db.add(AuditLog(actor_user_id=current_user.id, action="PHOTO_PUBLISH", entity_type="photo", entity_id=photo_id, meta={"is_published": is_published}))
        if is_published:
            await ws_manager.broadcast({"type": "photo_published", "photo_id": photo_id})
    if caption is not None:
        photo.caption = caption
    await db.commit()
    return {"message": "Updated"}


@router.post("/{photo_id}/like")
async def like_photo(
    photo_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = await db.execute(select(PhotoLike).where(PhotoLike.photo_id == photo_id, PhotoLike.user_id == current_user.id))
    like = existing.scalar_one_or_none()
    if like:
        # Unlike
        await db.execute(PhotoLike.__table__.delete().where(PhotoLike.photo_id == photo_id, PhotoLike.user_id == current_user.id))
        await db.commit()
        return {"liked": False}
    like = PhotoLike(photo_id=photo_id, user_id=current_user.id)
    db.add(like)
    await db.commit()
    return {"liked": True}
