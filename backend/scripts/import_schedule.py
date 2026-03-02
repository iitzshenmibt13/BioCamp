"""Import schedule items from CSV/Excel file."""
import asyncio
import sys
import uuid
from pathlib import Path

import pandas as pd
import pytz
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.config import settings
from app.models import ScheduleItem

tz = pytz.timezone("Asia/Taipei")

EXPECTED_COLS = ["title", "start_at", "end_at", "location_text", "maps_url", "description", "is_published"]


async def import_schedule(file_path: str, staff_user_id: str):
    path = Path(file_path)
    if not path.exists():
        print(f"File not found: {file_path}")
        sys.exit(1)

    if path.suffix.lower() in (".xlsx", ".xls"):
        df = pd.read_excel(file_path)
    else:
        df = pd.read_csv(file_path)

    missing = [c for c in EXPECTED_COLS if c not in df.columns]
    if missing:
        print(f"Missing columns: {missing}. Expected: {EXPECTED_COLS}")
        sys.exit(1)

    engine = create_async_engine(settings.database_url)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    created = 0

    async with SessionLocal() as db:
        for _, row in df.iterrows():
            try:
                start = pd.to_datetime(row["start_at"])
                end = pd.to_datetime(row["end_at"])
                if start.tzinfo is None:
                    start = tz.localize(start.to_pydatetime())
                if end.tzinfo is None:
                    end = tz.localize(end.to_pydatetime())
                item = ScheduleItem(
                    id=str(uuid.uuid4()),
                    title=str(row["title"]),
                    description=str(row.get("description", "")) or None,
                    start_at=start,
                    end_at=end,
                    location_text=str(row.get("location_text", "")) or None,
                    maps_url=str(row.get("maps_url", "")) or None,
                    is_published=bool(row.get("is_published", False)),
                    updated_by=staff_user_id,
                )
                db.add(item)
                created += 1
            except Exception as e:
                print(f"  ⚠️ Skipping row {_}: {e}")
        await db.commit()
    print(f"✅ Imported {created} schedule items from {file_path}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python import_schedule.py <file.csv|file.xlsx> <staff_user_id>")
        sys.exit(1)
    asyncio.run(import_schedule(sys.argv[1], sys.argv[2]))
