"""LINE Messaging API webhook handler."""
import hashlib
import hmac
import base64
import json
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.services.line_push import push_text, push_flex_leaderboard, push_flex_schedule

router = APIRouter()

LIFF_BASE = "https://liff.line.me"


def verify_signature(body: bytes, signature: str) -> bool:
    secret = settings.line_channel_secret.encode()
    expected = base64.b64encode(hmac.new(secret, body, hashlib.sha256).digest()).decode()
    return hmac.compare_digest(expected, signature)


@router.post("/webhook")
async def line_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.body()
    sig = request.headers.get("X-Line-Signature", "")
    if not verify_signature(body, sig):
        raise HTTPException(400, "Invalid signature")

    payload = json.loads(body)
    liff_id = settings.line_login_channel_id  # We use LIFF ID from env

    for event in payload.get("events", []):
        if event.get("type") != "message":
            continue
        msg_text = event.get("message", {}).get("text", "").strip().lower()
        reply_token = event.get("replyToken")

        if not reply_token or reply_token == "00000000000000000000000000000000":
            continue

        if msg_text in ("schedule", "時間表", "行程"):
            await push_flex_schedule(reply_token, db)
        elif msg_text in ("leaderboard", "排行榜", "積分"):
            await push_flex_leaderboard(reply_token, db)
        elif msg_text in ("今天", "today", "now"):
            await push_flex_schedule(reply_token, db, today_only=True)
        elif msg_text in ("help", "?", "選單"):
            await _send_menu(reply_token)
        else:
            await _send_menu(reply_token)

    return {"status": "ok"}


async def _send_menu(reply_token: str):
    liff_id = settings.line_login_channel_id
    await push_text(reply_token, "🧬 Camp Ops Menu – type a keyword or tap below!", reply=True, quick_replies=[
        {"label": "📅 Schedule", "text": "schedule"},
        {"label": "🏆 Leaderboard", "text": "leaderboard"},
        {"label": "📝 Homework", "url": f"https://liff.line.me/{liff_id}/homework"},
        {"label": "📍 My Group", "url": f"https://liff.line.me/{liff_id}/me"},
    ])
