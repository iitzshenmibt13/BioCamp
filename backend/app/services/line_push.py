"""LINE push message helpers."""
import httpx
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.config import settings


LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push"
LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply"


def _headers() -> dict:
    return {"Authorization": f"Bearer {settings.line_channel_access_token}", "Content-Type": "application/json"}


async def push_to_user(line_user_id: str, messages: list) -> None:
    async with httpx.AsyncClient() as client:
        await client.post(LINE_PUSH_URL, json={"to": line_user_id, "messages": messages}, headers=_headers())


async def push_text(reply_token: str, text: str, reply: bool = True, quick_replies: list = None) -> None:
    msg = {"type": "text", "text": text}
    if quick_replies:
        items = []
        for qr in quick_replies:
            if "url" in qr:
                items.append({"type": "action", "action": {"type": "uri", "label": qr["label"], "uri": qr["url"]}})
            else:
                items.append({"type": "action", "action": {"type": "message", "label": qr["label"], "text": qr["text"]}})
        msg["quickReply"] = {"items": items}
    payload = {"replyToken": reply_token, "messages": [msg]}
    async with httpx.AsyncClient() as client:
        await client.post(LINE_REPLY_URL, json=payload, headers=_headers())


async def push_flex_leaderboard(reply_token: str, db: AsyncSession) -> None:
    from app.models import Group, PointTransaction
    groups_result = await db.execute(select(Group))
    groups = groups_result.scalars().all()
    rows = []
    for g in groups:
        pts_q = await db.execute(
            select(func.coalesce(func.sum(PointTransaction.delta_points), 0))
            .where(PointTransaction.group_id == g.id)
            .where(PointTransaction.is_reversed == False)
        )
        rows.append({"name": g.name, "color": g.color, "pts": int(pts_q.scalar() or 0)})
    rows.sort(key=lambda x: x["pts"], reverse=True)

    body_contents = [
        {
            "type": "box", "layout": "horizontal",
            "contents": [
                {"type": "text", "text": f"#{i+1}", "color": "#888888", "flex": 1, "size": "sm"},
                {"type": "text", "text": r["name"], "flex": 4, "size": "sm", "weight": "bold"},
                {"type": "text", "text": str(r["pts"]), "flex": 2, "size": "sm", "align": "end", "color": r["color"]},
            ]
        }
        for i, r in enumerate(rows[:5])
    ]

    flex = {
        "type": "flex", "altText": "🏆 Leaderboard",
        "contents": {
            "type": "bubble",
            "header": {"type": "box", "layout": "vertical", "contents": [{"type": "text", "text": "🏆 Leaderboard", "weight": "bold", "size": "lg", "color": "#ffffff"}], "backgroundColor": "#2e7d32"},
            "body": {"type": "box", "layout": "vertical", "contents": body_contents},
        }
    }
    payload = {"replyToken": reply_token, "messages": [flex]}
    async with httpx.AsyncClient() as client:
        await client.post(LINE_REPLY_URL, json=payload, headers=_headers())


async def push_flex_schedule(reply_token: str, db: AsyncSession, today_only: bool = False) -> None:
    from app.models import ScheduleItem
    import pytz
    tz = pytz.timezone("Asia/Taipei")
    now = datetime.now(tz)
    query = select(ScheduleItem).where(ScheduleItem.is_published == True).order_by(ScheduleItem.start_at)
    if today_only:
        import datetime as dt_mod
        today_start = tz.localize(dt_mod.datetime.combine(now.date(), dt_mod.time.min))
        today_end = tz.localize(dt_mod.datetime.combine(now.date(), dt_mod.time.max))
        query = query.where(ScheduleItem.start_at >= today_start).where(ScheduleItem.end_at <= today_end)
    result = await db.execute(query)
    items = result.scalars().all()[:5]
    rows = []
    for item in items:
        start_local = item.start_at.astimezone(tz).strftime("%H:%M")
        rows.append({"type": "box", "layout": "horizontal", "contents": [
            {"type": "text", "text": start_local, "flex": 2, "size": "sm", "color": "#888888"},
            {"type": "text", "text": item.title, "flex": 5, "size": "sm"},
            {"type": "text", "text": item.location_text or "", "flex": 3, "size": "xs", "color": "#aaaaaa"},
        ]})
    flex = {
        "type": "flex", "altText": "📅 Schedule",
        "contents": {
            "type": "bubble",
            "header": {"type": "box", "layout": "vertical", "contents": [{"type": "text", "text": "📅 Today's Schedule" if today_only else "📅 Schedule", "weight": "bold", "color": "#ffffff"}], "backgroundColor": "#1565c0"},
            "body": {"type": "box", "layout": "vertical", "contents": rows or [{"type": "text", "text": "No items"}]},
        }
    }
    payload = {"replyToken": reply_token, "messages": [flex]}
    async with httpx.AsyncClient() as client:
        await client.post(LINE_REPLY_URL, json=payload, headers=_headers())


async def push_incident_alert(incident) -> None:
    """Push a high-severity incident alert to all staff (placeholder: uses single token)."""
    from app.database import AsyncSessionLocal
    from app.models import User, RoleEnum
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.role.in_([RoleEnum.staff, RoleEnum.admin])))
        staff = result.scalars().all()
    msg = f"🚨 HIGH SEVERITY INCIDENT\n\nCategory: {incident.category.value}\nDetails: {incident.content[:100]}\nContact: {incident.contact_phone or 'N/A'}"
    for s in staff:
        try:
            await push_to_user(s.line_user_id, [{"type": "text", "text": msg}])
        except Exception:
            pass
