"""Incidents router."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.database import get_db
from app.models import IncidentReport, User, IncidentCategoryEnum, IncidentSeverityEnum, IncidentStatusEnum
from app.auth.middleware import get_current_user, require_staff, get_optional_user
from app.services.line_push import push_incident_alert

router = APIRouter()


class IncidentCreate(BaseModel):
    category: IncidentCategoryEnum
    severity: IncidentSeverityEnum
    content: str
    contact_phone: Optional[str] = None
    group_id: Optional[str] = None


class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatusEnum] = None
    internal_notes: Optional[str] = None


@router.post("")
async def create_incident(
    body: IncidentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    incident = IncidentReport(
        reported_by_user_id=current_user.id if current_user else None,
        group_id=body.group_id or (current_user.group_id if current_user else None),
        category=body.category,
        severity=body.severity,
        content=body.content,
        contact_phone=body.contact_phone,
    )
    db.add(incident)
    await db.commit()
    await db.refresh(incident)

    # Notify staff on high severity
    if body.severity == IncidentSeverityEnum.high:
        try:
            await push_incident_alert(incident)
        except Exception:
            pass  # Don't fail the request if notification fails

    return {"id": incident.id, "message": "Incident reported"}


@router.get("")
async def list_incidents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(select(IncidentReport).order_by(IncidentReport.created_at.desc()))
    incidents = result.scalars().all()
    return [
        {
            "id": i.id,
            "category": i.category.value,
            "severity": i.severity.value,
            "content": i.content,
            "contact_phone": i.contact_phone,
            "status": i.status.value,
            "internal_notes": i.internal_notes,
            "created_at": i.created_at.isoformat(),
            "reported_by_user_id": i.reported_by_user_id,
            "group_id": i.group_id,
        }
        for i in incidents
    ]


@router.patch("/{incident_id}")
async def update_incident(
    incident_id: str,
    body: IncidentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(select(IncidentReport).where(IncidentReport.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(404, "Not found")
    if body.status:
        incident.status = body.status
    if body.internal_notes is not None:
        incident.internal_notes = body.internal_notes
    incident.updated_by = current_user.id
    await db.commit()
    return {"message": "Updated"}
