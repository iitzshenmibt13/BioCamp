"""Points router: leaderboard, transactions, undo."""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime

from app.database import get_db
from app.models import PointTransaction, Group, User, AuditLog, PointCategoryEnum, RoleEnum
from app.auth.middleware import get_current_user, require_staff
from app.ws.manager import ws_manager

router = APIRouter()


class TransactionCreate(BaseModel):
    group_id: str
    delta_points: int
    category: PointCategoryEnum
    reason: str


@router.get("/leaderboard")
async def get_leaderboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    groups_result = await db.execute(select(Group))
    groups = groups_result.scalars().all()
    leaderboard = []
    for group in groups:
        pts_q = await db.execute(
            select(func.coalesce(func.sum(PointTransaction.delta_points), 0))
            .where(PointTransaction.group_id == group.id)
            .where(PointTransaction.is_reversed == False)
        )
        total = pts_q.scalar() or 0
        # Get last transaction reason
        last_tx_q = await db.execute(
            select(PointTransaction)
            .where(PointTransaction.group_id == group.id)
            .where(PointTransaction.is_reversed == False)
            .order_by(PointTransaction.created_at.desc())
            .limit(1)
        )
        last_tx = last_tx_q.scalar_one_or_none()
        leaderboard.append({
            "group_id": group.id,
            "name": group.name,
            "color": group.color,
            "total_points": int(total),
            "last_reason": last_tx.reason if last_tx else None,
            "last_change": int(last_tx.delta_points) if last_tx else None,
        })
    leaderboard.sort(key=lambda x: x["total_points"], reverse=True)
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1
    return leaderboard


@router.get("/group/{group_id}/transactions")
async def get_group_transactions(
    group_id: str,
    category: Optional[PointCategoryEnum] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == RoleEnum.camper and current_user.group_id != group_id:
        raise HTTPException(403, "Can only view your own group's transactions")
    query = select(PointTransaction, User.display_name).join(
        User, PointTransaction.created_by == User.id
    ).where(PointTransaction.group_id == group_id).order_by(PointTransaction.created_at.desc())
    if category:
        query = query.where(PointTransaction.category == category)
    result = await db.execute(query)
    rows = result.all()
    return [
        {
            "id": tx.id,
            "delta_points": tx.delta_points,
            "category": tx.category.value,
            "reason": tx.reason,
            "created_at": tx.created_at.isoformat(),
            "created_by_name": display_name,
            "is_reversed": tx.is_reversed,
            "reversed_of": tx.reversed_of,
        }
        for tx, display_name in rows
    ]


@router.post("/transactions")
async def create_transaction(
    body: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    # Verify group exists
    grp = await db.execute(select(Group).where(Group.id == body.group_id))
    if not grp.scalar_one_or_none():
        raise HTTPException(404, "Group not found")
    tx = PointTransaction(
        group_id=body.group_id,
        delta_points=body.delta_points,
        category=body.category,
        reason=body.reason,
        created_by=current_user.id,
    )
    db.add(tx)
    db.add(AuditLog(
        actor_user_id=current_user.id,
        action="POINT_ADD",
        entity_type="point_transaction",
        entity_id="pending",
        meta={"group_id": body.group_id, "delta": body.delta_points, "reason": body.reason},
    ))
    await db.commit()
    await db.refresh(tx)
    await ws_manager.broadcast({
        "type": "points_updated",
        "group_id": body.group_id,
        "delta": body.delta_points,
        "reason": body.reason,
    })
    return {"id": tx.id, "delta_points": tx.delta_points, "reason": tx.reason}


@router.post("/transactions/{tx_id}/undo")
async def undo_transaction(
    tx_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(select(PointTransaction).where(PointTransaction.id == tx_id))
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(404, "Transaction not found")
    if tx.is_reversed:
        raise HTTPException(400, "Already reversed")
    # Mark original as reversed
    tx.is_reversed = True
    # Create reversal transaction
    reversal = PointTransaction(
        group_id=tx.group_id,
        delta_points=-tx.delta_points,
        category=tx.category,
        reason=f"[UNDO] {tx.reason}",
        created_by=current_user.id,
        reversed_of=tx.id,
    )
    db.add(reversal)
    db.add(AuditLog(
        actor_user_id=current_user.id,
        action="POINT_UNDO",
        entity_type="point_transaction",
        entity_id=tx_id,
        meta={"reversed_delta": tx.delta_points},
    ))
    await db.commit()
    await ws_manager.broadcast({"type": "points_updated", "group_id": tx.group_id})
    return {"message": "Undone", "reversal_id": reversal.id}
