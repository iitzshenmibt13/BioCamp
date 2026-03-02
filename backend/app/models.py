"""
All SQLAlchemy ORM models – single file for easy Alembic discovery.
Import this module in alembic/env.py to register all tables.
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    String, Text, Integer, Boolean, DateTime, Numeric,
    ForeignKey, UniqueConstraint, Enum as SAEnum, JSON
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database import Base


def new_uuid() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class RoleEnum(str, enum.Enum):
    camper = "camper"
    staff = "staff"
    admin = "admin"


class PointCategoryEnum(str, enum.Enum):
    game = "game"
    homework = "homework"
    attendance = "attendance"
    bonus = "bonus"
    penalty = "penalty"


class AssignmentScopeEnum(str, enum.Enum):
    individual = "individual"
    group = "group"


class AnnouncementTargetEnum(str, enum.Enum):
    all = "all"
    group = "group"
    staff = "staff"


class IncidentCategoryEnum(str, enum.Enum):
    health = "health"
    safety = "safety"
    other = "other"


class IncidentSeverityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class IncidentStatusEnum(str, enum.Enum):
    new = "new"
    triaged = "triaged"
    resolved = "resolved"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class Group(Base):
    __tablename__ = "groups"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    color: Mapped[str] = mapped_column(String(20), default="#4CAF50")
    join_code: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    users: Mapped[list["User"]] = relationship("User", back_populates="group")
    point_transactions: Mapped[list["PointTransaction"]] = relationship("PointTransaction", back_populates="group")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    line_user_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(200), default="")
    picture_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    role: Mapped[RoleEnum] = mapped_column(SAEnum(RoleEnum), default=RoleEnum.camper)
    group_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("groups.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    group: Mapped["Group | None"] = relationship("Group", back_populates="users")


class ScheduleItem(Base):
    __tablename__ = "schedule_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    day_index: Mapped[int | None] = mapped_column(Integer, nullable=True)
    location_text: Mapped[str | None] = mapped_column(String(300), nullable=True)
    location_lat: Mapped[float | None] = mapped_column(Numeric(10, 7), nullable=True)
    location_lng: Mapped[float | None] = mapped_column(Numeric(10, 7), nullable=True)
    maps_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class PointTransaction(Base):
    __tablename__ = "point_transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    group_id: Mapped[str] = mapped_column(String(36), ForeignKey("groups.id"), nullable=False)
    delta_points: Mapped[int] = mapped_column(Integer, nullable=False)
    category: Mapped[PointCategoryEnum] = mapped_column(SAEnum(PointCategoryEnum), nullable=False)
    reason: Mapped[str] = mapped_column(Text, default="")
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    reversed_of: Mapped[str | None] = mapped_column(String(36), ForeignKey("point_transactions.id"), nullable=True)
    is_reversed: Mapped[bool] = mapped_column(Boolean, default=False)

    group: Mapped["Group"] = relationship("Group", back_populates="point_transactions")
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])


class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    instructions: Mapped[str | None] = mapped_column(Text)
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    max_score: Mapped[int] = mapped_column(Integer, default=100)
    scope: Mapped[AssignmentScopeEnum] = mapped_column(SAEnum(AssignmentScopeEnum), default=AssignmentScopeEnum.individual)
    auto_award_points: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    submissions: Mapped[list["Submission"]] = relationship("Submission", back_populates="assignment")


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    assignment_id: Mapped[str] = mapped_column(String(36), ForeignKey("assignments.id"), nullable=False)
    submitted_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    group_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("groups.id"), nullable=True)
    content_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    assignment: Mapped["Assignment"] = relationship("Assignment", back_populates="submissions")
    grade: Mapped["Grade | None"] = relationship("Grade", back_populates="submission", uselist=False)
    submitter: Mapped["User"] = relationship("User", foreign_keys=[submitted_by])


class Grade(Base):
    __tablename__ = "grades"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    submission_id: Mapped[str] = mapped_column(String(36), ForeignKey("submissions.id"), unique=True, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    rubric_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    graded_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    graded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)

    submission: Mapped["Submission"] = relationship("Submission", back_populates="grade")
    grader: Mapped["User"] = relationship("User", foreign_keys=[graded_by])


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    target: Mapped[AnnouncementTargetEnum] = mapped_column(SAEnum(AnnouncementTargetEnum), default=AnnouncementTargetEnum.all)
    target_group_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("groups.id"), nullable=True)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])


class CheckinCheckpoint(Base):
    __tablename__ = "checkin_checkpoints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    schedule_item_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("schedule_items.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    qr_secret: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    valid_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    valid_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    points_award: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    checkins: Mapped[list["Checkin"]] = relationship("Checkin", back_populates="checkpoint")


class Checkin(Base):
    __tablename__ = "checkins"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    checkpoint_id: Mapped[str] = mapped_column(String(36), ForeignKey("checkin_checkpoints.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    group_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("groups.id"), nullable=True)
    checked_in_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "checkpoint_id", name="uq_user_checkpoint"),)

    checkpoint: Mapped["CheckinCheckpoint"] = relationship("CheckinCheckpoint", back_populates="checkins")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    taken_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    uploaded_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    likes: Mapped[list["PhotoLike"]] = relationship("PhotoLike", back_populates="photo")
    uploader: Mapped["User"] = relationship("User", foreign_keys=[uploaded_by])


class PhotoLike(Base):
    __tablename__ = "photo_likes"

    photo_id: Mapped[str] = mapped_column(String(36), ForeignKey("photos.id"), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), primary_key=True)

    photo: Mapped["Photo"] = relationship("Photo", back_populates="likes")


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    reported_by_user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    group_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("groups.id"), nullable=True)
    category: Mapped[IncidentCategoryEnum] = mapped_column(SAEnum(IncidentCategoryEnum), nullable=False)
    severity: Mapped[IncidentSeverityEnum] = mapped_column(SAEnum(IncidentSeverityEnum), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    contact_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    status: Mapped[IncidentStatusEnum] = mapped_column(SAEnum(IncidentStatusEnum), default=IncidentStatusEnum.new)
    internal_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)

    reporter: Mapped["User | None"] = relationship("User", foreign_keys=[reported_by_user_id])


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    actor_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(36), nullable=False)
    meta: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    actor: Mapped["User"] = relationship("User", foreign_keys=[actor_user_id])
