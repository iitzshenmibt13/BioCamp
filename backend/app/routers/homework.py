"""Homework router: assignments, submissions (file/text), grades."""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.database import get_db
from app.models import Assignment, Submission, Grade, User, AuditLog, RoleEnum, AssignmentScopeEnum, PointTransaction, PointCategoryEnum
from app.auth.middleware import get_current_user, require_staff
from app.services.s3 import upload_file

router = APIRouter()


class AssignmentCreate(BaseModel):
    title: str
    instructions: Optional[str] = None
    due_at: Optional[datetime] = None
    max_score: int = 100
    scope: AssignmentScopeEnum = AssignmentScopeEnum.individual
    auto_award_points: Optional[int] = None


class GradeCreate(BaseModel):
    submission_id: str
    score: int
    rubric_json: Optional[list] = None
    feedback: Optional[str] = None
    publish: bool = False


@router.get("/assignments")
async def list_assignments(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Assignment).order_by(Assignment.created_at.desc()))
    assignments = result.scalars().all()
    return [
        {
            "id": a.id, "title": a.title, "instructions": a.instructions,
            "due_at": a.due_at.isoformat() if a.due_at else None,
            "max_score": a.max_score, "scope": a.scope.value,
            "auto_award_points": a.auto_award_points,
            "created_at": a.created_at.isoformat(),
        }
        for a in assignments
    ]


@router.post("/assignments")
async def create_assignment(
    body: AssignmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    a = Assignment(**body.model_dump(), created_by=current_user.id)
    db.add(a)
    await db.commit()
    await db.refresh(a)
    return {"id": a.id, "title": a.title}


@router.post("/submissions")
async def submit_homework(
    assignment_id: str = Form(...),
    content_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not content_text and not file:
        raise HTTPException(400, "Provide text or file")
    file_url = None
    if file:
        file_url = await upload_file(file, folder="submissions")
    sub = Submission(
        assignment_id=assignment_id,
        submitted_by=current_user.id,
        group_id=current_user.group_id,
        content_text=content_text,
        file_url=file_url,
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return {"id": sub.id, "submitted_at": sub.submitted_at.isoformat()}


@router.get("/submissions")
async def list_submissions(
    assignment_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    query = select(Submission).order_by(Submission.submitted_at.desc())
    if assignment_id:
        query = query.where(Submission.assignment_id == assignment_id)
    result = await db.execute(query)
    subs = result.scalars().all()
    return [
        {
            "id": s.id, "assignment_id": s.assignment_id,
            "submitted_by": s.submitted_by, "group_id": s.group_id,
            "content_text": s.content_text, "file_url": s.file_url,
            "submitted_at": s.submitted_at.isoformat(),
        }
        for s in subs
    ]


@router.post("/grades")
async def grade_submission(
    body: GradeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(select(Submission).where(Submission.id == body.submission_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(404, "Submission not found")
    # Check existing grade
    existing = await db.execute(select(Grade).where(Grade.submission_id == body.submission_id))
    grade = existing.scalar_one_or_none()
    if grade:
        grade.score = body.score
        grade.rubric_json = body.rubric_json
        grade.feedback = body.feedback
        grade.graded_by = current_user.id
        grade.graded_at = datetime.utcnow()
        if body.publish:
            grade.is_published = True
    else:
        grade = Grade(
            submission_id=body.submission_id,
            score=body.score,
            rubric_json=body.rubric_json,
            feedback=body.feedback,
            graded_by=current_user.id,
            is_published=body.publish,
        )
        db.add(grade)
    db.add(AuditLog(actor_user_id=current_user.id, action="GRADE_CREATE", entity_type="grade", entity_id=body.submission_id, meta={"score": body.score}))

    # Auto-award points
    if body.publish and sub.group_id:
        asgn = await db.execute(select(Assignment).where(Assignment.id == sub.assignment_id))
        asgn = asgn.scalar_one_or_none()
        if asgn and asgn.auto_award_points:
            tx = PointTransaction(
                group_id=sub.group_id,
                delta_points=asgn.auto_award_points,
                category=PointCategoryEnum.homework,
                reason=f"Homework: {asgn.title}",
                created_by=current_user.id,
            )
            db.add(tx)
    await db.commit()
    return {"message": "Graded"}


@router.post("/grades/{grade_id}/publish")
async def publish_grade(
    grade_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_staff),
):
    result = await db.execute(select(Grade).where(Grade.id == grade_id))
    grade = result.scalar_one_or_none()
    if not grade:
        raise HTTPException(404, "Grade not found")
    grade.is_published = True
    await db.commit()
    return {"message": "Published"}


@router.get("/my-submissions")
async def my_submissions(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Submission).where(Submission.submitted_by == current_user.id)
        .order_by(Submission.submitted_at.desc())
    )
    subs = result.scalars().all()
    out = []
    for s in subs:
        grade_result = await db.execute(select(Grade).where(Grade.submission_id == s.id))
        grade = grade_result.scalar_one_or_none()
        out.append({
            "id": s.id, "assignment_id": s.assignment_id,
            "submitted_at": s.submitted_at.isoformat(), "file_url": s.file_url,
            "content_text": s.content_text,
            "grade": {"score": grade.score, "feedback": grade.feedback, "rubric_json": grade.rubric_json} if grade and grade.is_published else None,
        })
    return out
