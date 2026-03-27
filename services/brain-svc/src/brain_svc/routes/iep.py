"""IEP routes — document and goal management."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from brain_svc.db import get_session
from brain_svc.middleware.auth import require_auth
from brain_svc.services.iep_profile import (
    confirm_iep_document,
    create_iep_document,
    create_iep_goal,
    get_iep_documents,
    get_iep_goals,
    update_iep_goal_progress,
)

router = APIRouter(prefix="/iep", tags=["iep"])


class IepDocumentResponse(BaseModel):
    id: str
    learner_id: str
    uploaded_by: str
    file_url: str
    file_type: str
    parsed_data: dict[str, Any] = Field(default_factory=dict)
    parse_status: str | None = None
    confirmed_by: str | None = None
    confirmed_at: str | None = None


class UploadIepRequest(BaseModel):
    learner_id: str
    uploaded_by: str
    file_url: str
    file_type: str
    parsed_data: dict[str, Any] | None = None


class IepGoalResponse(BaseModel):
    id: str
    learner_id: str
    iep_document_id: str
    goal_text: str
    domain: str
    target_metric: str | None = None
    target_value: float | None = None
    current_value: float | None = None
    status: str | None = None


class CreateIepGoalRequest(BaseModel):
    learner_id: str
    iep_document_id: str
    goal_text: str
    domain: str
    target_metric: str | None = None
    target_value: float | None = None


class UpdateGoalProgressRequest(BaseModel):
    current_value: float


def _doc_response(doc) -> IepDocumentResponse:
    return IepDocumentResponse(
        id=str(doc.id),
        learner_id=str(doc.learner_id),
        uploaded_by=str(doc.uploaded_by),
        file_url=doc.file_url,
        file_type=doc.file_type,
        parsed_data=doc.parsed_data or {},
        parse_status=doc.parse_status,
        confirmed_by=str(doc.confirmed_by) if doc.confirmed_by else None,
        confirmed_at=doc.confirmed_at.isoformat() if doc.confirmed_at else None,
    )


def _goal_response(goal) -> IepGoalResponse:
    return IepGoalResponse(
        id=str(goal.id),
        learner_id=str(goal.learner_id),
        iep_document_id=str(goal.iep_document_id),
        goal_text=goal.goal_text,
        domain=goal.domain,
        target_metric=goal.target_metric,
        target_value=goal.target_value,
        current_value=goal.current_value,
        status=goal.status,
    )


@router.get("/documents/{learner_id}", response_model=list[IepDocumentResponse])
async def list_iep_documents(learner_id: str, _claims: dict = Depends(require_auth)):
    async with get_session() as session:
        docs = await get_iep_documents(session, learner_id)
        return [_doc_response(d) for d in docs]


@router.post("/documents", response_model=IepDocumentResponse, status_code=201)
async def upload_iep_document(body: UploadIepRequest, _claims: dict = Depends(require_auth)):
    async with get_session() as session:
        doc = await create_iep_document(
            session=session,
            learner_id=body.learner_id,
            uploaded_by=body.uploaded_by,
            file_url=body.file_url,
            file_type=body.file_type,
            parsed_data=body.parsed_data,
        )
        return _doc_response(doc)


@router.post("/documents/{document_id}/confirm", response_model=IepDocumentResponse)
async def confirm_document(
    document_id: str,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        from sqlalchemy import select
        from brain_svc.models.iep import IepDocument
        import uuid

        result = await session.execute(
            select(IepDocument).where(IepDocument.id == uuid.UUID(document_id))
        )
        doc = result.scalar_one_or_none()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        confirmed_by = _claims.get("sub", "")
        doc = await confirm_iep_document(session, doc, confirmed_by)
        return _doc_response(doc)


@router.get("/goals/{learner_id}", response_model=list[IepGoalResponse])
async def list_iep_goals(
    learner_id: str,
    status: str | None = None,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        goals = await get_iep_goals(session, learner_id, status=status)
        return [_goal_response(g) for g in goals]


@router.post("/goals", response_model=IepGoalResponse, status_code=201)
async def create_goal(body: CreateIepGoalRequest, _claims: dict = Depends(require_auth)):
    async with get_session() as session:
        goal = await create_iep_goal(
            session=session,
            learner_id=body.learner_id,
            iep_document_id=body.iep_document_id,
            goal_text=body.goal_text,
            domain=body.domain,
            target_metric=body.target_metric,
            target_value=body.target_value,
        )
        return _goal_response(goal)


@router.patch("/goals/{goal_id}/progress", response_model=IepGoalResponse)
async def update_goal_progress(
    goal_id: str,
    body: UpdateGoalProgressRequest,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        from sqlalchemy import select
        from brain_svc.models.iep import IepGoal
        import uuid

        result = await session.execute(
            select(IepGoal).where(IepGoal.id == uuid.UUID(goal_id))
        )
        goal = result.scalar_one_or_none()
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")
        goal = await update_iep_goal_progress(session, goal, body.current_value)
        return _goal_response(goal)
