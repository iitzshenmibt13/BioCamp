"""Check-in router: QR checkpoints + scan + history."""
import hashlib
import hmac
import secrets
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import qrcode
import io

from app.database import get_db
from app.models import CheckinCheckpoint, Checkin, User, AuditLog, PointTransaction, PointCategoryEnum
from app.auth.middleware import get_current_user, require_staff

router = APIRouter()


class CheckpointCreate(BaseModel):
    title: str
    schedule_item_id: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    points_award: Optional[int] = None


class CheckinRequest(BaseModel):
    checkpoint_id: str
    qr_payload: str  # format: "{checkpoint_id}:{hmac_signature}"


def make_qr_payload(checkpoint: CheckinCheckpoint) -> str:
    """Generate HMAC-signed QR payload."""
    msg = checkpoint.id.encode()
    sig = hmac.new(checkpoint.qr_secret.encode(), msg, hashlib.sha256).hexdigest()[:16]
    return f"{checkpoint.id}:{sig}"


def verify_qr_payload(payload: str, checkpoint: CheckinCheckpoint) -> bool:
    try:
        parts = payload.split(":")
        if parts[0] != checkpoint.id:
            return False
        expected_sig = hmac.new(checkpoint.qr_secret.encode(), checkpoint.id.encode(), hashlib.sha256).hexdigest()[:16]
        return hmac.compare_digest(parts[1], expected_sig)
    except Exception:
        return False


@router.post("/checkpoints")
async def create_checkpoint(
    body: CheckpointCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    cp = CheckinCheckpoint(
        **body.model_dump(),
        qr_secret=secrets.token_hex(32),
        created_by=current_user.id,
    )
    db.add(cp)
    await db.commit()
    await db.refresh(cp)
    return {"id": cp.id, "title": cp.title, "qr_payload": make_qr_payload(cp)}


@router.get("/checkpoints/{checkpoint_id}/qr")
async def get_qr_image(
    checkpoint_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(select(CheckinCheckpoint).where(CheckinCheckpoint.id == checkpoint_id))
    cp = result.scalar_one_or_none()
    if not cp:
        raise HTTPException(404, "Checkpoint not found")
    payload = make_qr_payload(cp)
    img = qrcode.make(payload)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return Response(content=buf.read(), media_type="image/png")


@router.post("/checkin")
async def scan_checkin(
    body: CheckinRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(CheckinCheckpoint).where(CheckinCheckpoint.id == body.checkpoint_id))
    cp = result.scalar_one_or_none()
    if not cp:
        raise HTTPException(404, "Checkpoint not found")
    if not verify_qr_payload(body.qr_payload, cp):
        raise HTTPException(400, "Invalid QR payload")

    now = datetime.now(timezone.utc)
    if cp.valid_from and now < cp.valid_from:
        raise HTTPException(400, "Check-in not yet open")
    if cp.valid_to and now > cp.valid_to:
        raise HTTPException(400, "Check-in window closed")

    # Duplicate check
    existing = await db.execute(
        select(Checkin).where(Checkin.user_id == current_user.id).where(Checkin.checkpoint_id == cp.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Already checked in to this checkpoint")

    checkin = Checkin(checkpoint_id=cp.id, user_id=current_user.id, group_id=current_user.group_id)
    db.add(checkin)

    if cp.points_award and current_user.group_id:
        tx = PointTransaction(
            group_id=current_user.group_id,
            delta_points=cp.points_award,
            category=PointCategoryEnum.attendance,
            reason=f"Check-in: {cp.title}",
            created_by=current_user.id,
        )
        db.add(tx)

    db.add(AuditLog(
        actor_user_id=current_user.id,
        action="CHECKIN",
        entity_type="checkin",
        entity_id=cp.id,
        meta={"checkpoint_title": cp.title},
    ))
    await db.commit()
    return {"message": "Checked in!", "points_awarded": cp.points_award}


@router.get("/checkin/history")
async def checkin_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Checkin, CheckinCheckpoint.title)
        .join(CheckinCheckpoint, Checkin.checkpoint_id == CheckinCheckpoint.id)
        .where(Checkin.user_id == current_user.id)
        .order_by(Checkin.checked_in_at.desc())
    )
    return [
        {"checkpoint_title": title, "checked_in_at": ci.checked_in_at.isoformat()}
        for ci, title in result.all()
    ]


@router.get("/checkpoints/{checkpoint_id}/attendance")
async def get_attendance(
    checkpoint_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(
        select(Checkin, User.display_name)
        .join(User, Checkin.user_id == User.id)
        .where(Checkin.checkpoint_id == checkpoint_id)
        .order_by(Checkin.checked_in_at)
    )
    return [
        {"user_display_name": name, "checked_in_at": ci.checked_in_at.isoformat(), "group_id": ci.group_id}
        for ci, name in result.all()
    ]
