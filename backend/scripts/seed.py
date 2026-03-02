"""Seed database with sample data for development."""
import asyncio
import uuid
from datetime import datetime, timedelta
import pytz

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.config import settings
from app.models import Base, Group, User, ScheduleItem, Assignment, Announcement, RoleEnum, AssignmentScopeEnum, AnnouncementTargetEnum

tz = pytz.timezone("Asia/Taipei")

async def seed():
    engine = create_async_engine(settings.database_url)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with SessionLocal() as db:
        # Create groups
        groups = [
            Group(id=str(uuid.uuid4()), name="Alpha", color="#e53935", join_code="ALPHA"),
            Group(id=str(uuid.uuid4()), name="Beta", color="#1e88e5", join_code="BETA"),
            Group(id=str(uuid.uuid4()), name="Gamma", color="#43a047", join_code="GAMMA"),
            Group(id=str(uuid.uuid4()), name="Delta", color="#fb8c00", join_code="DELTA"),
        ]
        for g in groups:
            db.add(g)
        await db.flush()

        # Create a staff user
        staff = User(
            id=str(uuid.uuid4()),
            line_user_id="U_ADMIN_SEED",
            display_name="Camp Admin",
            role=RoleEnum.admin,
        )
        db.add(staff)
        await db.flush()

        # Create schedule items
        today = datetime.now(tz).replace(hour=0, minute=0, second=0)
        schedule = [
            ScheduleItem(id=str(uuid.uuid4()), title="Registration & Welcome", description="Check in and pick up your name badge!", start_at=today.replace(hour=8, minute=30), end_at=today.replace(hour=9, minute=30), day_index=1, location_text="Main Hall", is_published=True, updated_by=staff.id),
            ScheduleItem(id=str(uuid.uuid4()), title="Opening Ceremony", description="Welcome speech and group introductions.", start_at=today.replace(hour=9, minute=30), end_at=today.replace(hour=10, minute=0), day_index=1, location_text="Auditorium", is_published=True, updated_by=staff.id),
            ScheduleItem(id=str(uuid.uuid4()), title="Lab Experiment: DNA Extraction", description="Extract DNA from a strawberry!", start_at=today.replace(hour=10, minute=0), end_at=today.replace(hour=12, minute=0), day_index=1, location_text="Biology Lab A", location_lat=25.033, location_lng=121.565, maps_url="https://maps.google.com/?q=25.033,121.565", is_published=True, updated_by=staff.id),
            ScheduleItem(id=str(uuid.uuid4()), title="Lunch Break", start_at=today.replace(hour=12, minute=0), end_at=today.replace(hour=13, minute=0), day_index=1, location_text="Cafeteria", is_published=True, updated_by=staff.id),
            ScheduleItem(id=str(uuid.uuid4()), title="Group Biology Quiz Game", description="Teams compete in a biology trivia challenge. Points awarded!", start_at=today.replace(hour=13, minute=0), end_at=today.replace(hour=14, minute=30), day_index=1, location_text="Main Hall", is_published=True, updated_by=staff.id),
            ScheduleItem(id=str(uuid.uuid4()), title="Microscopy Workshop", description="Observe cell samples under the microscope.", start_at=today.replace(hour=14, minute=30), end_at=today.replace(hour=16, minute=0), day_index=1, location_text="Biology Lab B", is_published=True, updated_by=staff.id),
            ScheduleItem(id=str(uuid.uuid4()), title="Evening Campfire & Reflection", start_at=today.replace(hour=19, minute=0), end_at=today.replace(hour=20, minute=30), day_index=1, location_text="Outdoor Amphitheatre", is_published=True, updated_by=staff.id),
        ]
        for s in schedule:
            db.add(s)

        # Create assignment
        assignment = Assignment(
            id=str(uuid.uuid4()),
            title="Lab Report: DNA Extraction",
            instructions="Write a 1-page lab report describing the DNA extraction experiment. Include: hypothesis, materials, procedure, observations, and conclusion.",
            due_at=(today + timedelta(days=1)).replace(hour=22, minute=0),
            max_score=100,
            scope=AssignmentScopeEnum.individual,
            auto_award_points=10,
            created_by=staff.id,
        )
        db.add(assignment)

        # Create announcement
        announcement = Announcement(
            id=str(uuid.uuid4()),
            title="🎉 Welcome to Biology Camp 2026!",
            content="Welcome everyone! We're so excited to have you here. Check the Schedule tab for today's activities. Don't forget to join your group using the join code on your name badge!",
            target=AnnouncementTargetEnum.all,
            is_pinned=True,
            created_by=staff.id,
        )
        db.add(announcement)

        await db.commit()
        print("✅ Seed data created successfully!")
        print(f"  Groups: {[g.name for g in groups]}")
        print(f"  Schedule items: {len(schedule)}")
        print(f"  Assignment: {assignment.title}")


if __name__ == "__main__":
    asyncio.run(seed())
