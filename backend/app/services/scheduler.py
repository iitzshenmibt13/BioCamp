"""APScheduler: 10-min reminders before schedule items + daily morning summary."""
import asyncio
import logging
from datetime import datetime, timedelta, timezone

import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select

from app.config import settings
from app.database import AsyncSessionLocal
from app.models import ScheduleItem, User, RoleEnum

logger = logging.getLogger(__name__)
tz = pytz.timezone(settings.tz)
scheduler = AsyncIOScheduler(timezone=tz)


async def send_10min_reminders():
    """Push reminder to all campers 10 minutes before each published schedule item."""
    from app.services.line_push import push_to_user
    now = datetime.now(tz)
    window_start = now + timedelta(minutes=9)
    window_end = now + timedelta(minutes=11)
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ScheduleItem)
            .where(ScheduleItem.is_published == True)
            .where(ScheduleItem.start_at >= window_start)
            .where(ScheduleItem.start_at <= window_end)
        )
        items = result.scalars().all()
        if not items:
            return
        users_result = await db.execute(select(User).where(User.role == RoleEnum.camper))
        users = users_result.scalars().all()
    for item in items:
        msg = f"⏰ Reminder: '{item.title}' starts in ~10 minutes!\n📍 {item.location_text or 'Check the schedule for location.'}"
        for user in users:
            try:
                await push_to_user(user.line_user_id, [{"type": "text", "text": msg}])
            except Exception as e:
                logger.warning(f"Failed to push to {user.line_user_id}: {e}")


async def send_daily_summary():
    """Push today's schedule highlights to all users at 8 AM Taipei time."""
    from app.services.line_push import push_to_user
    now = datetime.now(tz)
    today_str = now.strftime("%Y-%m-%d")
    today_start = tz.localize(datetime.strptime(today_str + " 00:00:00", "%Y-%m-%d %H:%M:%S"))
    today_end = today_start + timedelta(days=1)
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ScheduleItem)
            .where(ScheduleItem.is_published == True)
            .where(ScheduleItem.start_at >= today_start)
            .where(ScheduleItem.start_at < today_end)
            .order_by(ScheduleItem.start_at)
            .limit(5)
        )
        items = result.scalars().all()
        users_result = await db.execute(select(User))
        users = users_result.scalars().all()

    if not items:
        return
    lines = [f"🌅 Good morning! Today's schedule:"]
    for item in items:
        t = item.start_at.astimezone(tz).strftime("%H:%M")
        lines.append(f"  {t} – {item.title}")
    msg = "\n".join(lines)
    for user in users:
        try:
            await push_to_user(user.line_user_id, [{"type": "text", "text": msg}])
        except Exception:
            pass


async def start_scheduler():
    scheduler.add_job(send_10min_reminders, "interval", minutes=1, id="reminders")
    scheduler.add_job(send_daily_summary, "cron", hour=8, minute=0, id="daily_summary")
    scheduler.start()
    logger.info("Scheduler started.")


async def stop_scheduler():
    scheduler.shutdown(wait=False)
