"""Generic single database migration template for Alembic."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # groups
    op.create_table(
        "groups",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("color", sa.String(20), default="#4CAF50"),
        sa.Column("join_code", sa.String(20), nullable=True, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )

    # users
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("line_user_id", sa.String(50), nullable=False, unique=True),
        sa.Column("display_name", sa.String(200), default=""),
        sa.Column("picture_url", sa.Text, nullable=True),
        sa.Column("role", sa.Enum("camper", "staff", "admin", name="roleenum"), default="camper"),
        sa.Column("group_id", sa.String(36), sa.ForeignKey("groups.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )

    # schedule_items
    op.create_table(
        "schedule_items",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("start_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("day_index", sa.Integer, nullable=True),
        sa.Column("location_text", sa.String(300), nullable=True),
        sa.Column("location_lat", sa.Numeric(10, 7), nullable=True),
        sa.Column("location_lng", sa.Numeric(10, 7), nullable=True),
        sa.Column("maps_url", sa.Text, nullable=True),
        sa.Column("is_published", sa.Boolean, default=False),
        sa.Column("updated_by", sa.String(36), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )

    # point_transactions
    op.create_table(
        "point_transactions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("group_id", sa.String(36), sa.ForeignKey("groups.id"), nullable=False),
        sa.Column("delta_points", sa.Integer, nullable=False),
        sa.Column("category", sa.Enum("game", "homework", "attendance", "bonus", "penalty", name="pointcategoryenum"), nullable=False),
        sa.Column("reason", sa.Text, default=""),
        sa.Column("created_by", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("reversed_of", sa.String(36), sa.ForeignKey("point_transactions.id"), nullable=True),
        sa.Column("is_reversed", sa.Boolean, default=False),
    )

    # assignments
    op.create_table(
        "assignments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("instructions", sa.Text, nullable=True),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("max_score", sa.Integer, default=100),
        sa.Column("scope", sa.Enum("individual", "group", name="assignmentscopeenum")),
        sa.Column("auto_award_points", sa.Integer, nullable=True),
        sa.Column("created_by", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )

    # submissions
    op.create_table(
        "submissions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("assignment_id", sa.String(36), sa.ForeignKey("assignments.id"), nullable=False),
        sa.Column("submitted_by", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("group_id", sa.String(36), sa.ForeignKey("groups.id"), nullable=True),
        sa.Column("content_text", sa.Text, nullable=True),
        sa.Column("file_url", sa.Text, nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True)),
    )

    # grades
    op.create_table(
        "grades",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("submission_id", sa.String(36), sa.ForeignKey("submissions.id"), unique=True, nullable=False),
        sa.Column("score", sa.Integer, nullable=False),
        sa.Column("rubric_json", postgresql.JSONB, nullable=True),
        sa.Column("feedback", sa.Text, nullable=True),
        sa.Column("graded_by", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("graded_at", sa.DateTime(timezone=True)),
        sa.Column("is_published", sa.Boolean, default=False),
    )

    # announcements
    op.create_table(
        "announcements",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("target", sa.Enum("all", "group", "staff", name="announcementtargetenum")),
        sa.Column("target_group_id", sa.String(36), sa.ForeignKey("groups.id"), nullable=True),
        sa.Column("is_pinned", sa.Boolean, default=False),
        sa.Column("created_by", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )

    # checkin_checkpoints
    op.create_table(
        "checkin_checkpoints",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("schedule_item_id", sa.String(36), sa.ForeignKey("schedule_items.id"), nullable=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("qr_secret", sa.String(100), nullable=False, unique=True),
        sa.Column("valid_from", sa.DateTime(timezone=True), nullable=True),
        sa.Column("valid_to", sa.DateTime(timezone=True), nullable=True),
        sa.Column("points_award", sa.Integer, nullable=True),
        sa.Column("created_by", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )

    # checkins
    op.create_table(
        "checkins",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("checkpoint_id", sa.String(36), sa.ForeignKey("checkin_checkpoints.id"), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("group_id", sa.String(36), sa.ForeignKey("groups.id"), nullable=True),
        sa.Column("checked_in_at", sa.DateTime(timezone=True)),
        sa.UniqueConstraint("user_id", "checkpoint_id", name="uq_user_checkpoint"),
    )

    # photos
    op.create_table(
        "photos",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("url", sa.Text, nullable=False),
        sa.Column("caption", sa.Text, nullable=True),
        sa.Column("taken_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("uploaded_by", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("is_published", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )

    # photo_likes
    op.create_table(
        "photo_likes",
        sa.Column("photo_id", sa.String(36), sa.ForeignKey("photos.id"), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), primary_key=True),
    )

    # incident_reports
    op.create_table(
        "incident_reports",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("reported_by_user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("group_id", sa.String(36), sa.ForeignKey("groups.id"), nullable=True),
        sa.Column("category", sa.Enum("health", "safety", "other", name="incidentcategoryenum")),
        sa.Column("severity", sa.Enum("low", "medium", "high", name="incidentseverityenum")),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("contact_phone", sa.String(30), nullable=True),
        sa.Column("status", sa.Enum("new", "triaged", "resolved", name="incidentstatusenum"), default="new"),
        sa.Column("internal_notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_by", sa.String(36), sa.ForeignKey("users.id"), nullable=True),
    )

    # audit_logs
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("actor_user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("entity_type", sa.String(100), nullable=False),
        sa.Column("entity_id", sa.String(36), nullable=False),
        sa.Column("meta", postgresql.JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True)),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("incident_reports")
    op.drop_table("photo_likes")
    op.drop_table("photos")
    op.drop_table("checkins")
    op.drop_table("checkin_checkpoints")
    op.drop_table("announcements")
    op.drop_table("grades")
    op.drop_table("submissions")
    op.drop_table("assignments")
    op.drop_table("point_transactions")
    op.drop_table("schedule_items")
    op.drop_table("users")
    op.drop_table("groups")
