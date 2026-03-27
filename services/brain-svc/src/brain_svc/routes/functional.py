"""Functional curriculum routes — milestone tracking."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from brain_svc.db import get_session
from brain_svc.middleware.auth import require_auth
from brain_svc.services.functional_curriculum import (
    create_milestone,
    get_learner_milestones,
    get_milestones,
    update_milestone_status,
)

router = APIRouter(prefix="/functional", tags=["functional-curriculum"])


class MilestoneResponse(BaseModel):
    id: str
    domain: str
    name: str
    description: str
    order_index: int


class LearnerMilestoneResponse(BaseModel):
    id: str
    learner_id: str
    milestone_id: str
    status: str
    observations: list[dict[str, Any]] = Field(default_factory=list)
    last_observed_at: str | None = None


class CreateMilestoneRequest(BaseModel):
    domain: str
    name: str
    description: str
    order_index: int


class UpdateMilestoneStatusRequest(BaseModel):
    learner_id: str
    milestone_id: str
    status: str
    observation: str | None = None


@router.get("/milestones", response_model=list[MilestoneResponse])
async def list_milestones(domain: str | None = None, _claims: dict = Depends(require_auth)):
    async with get_session() as session:
        milestones = await get_milestones(session, domain=domain)
        return [
            MilestoneResponse(
                id=str(m.id), domain=m.domain, name=m.name,
                description=m.description, order_index=m.order_index,
            )
            for m in milestones
        ]


@router.post("/milestones", response_model=MilestoneResponse, status_code=201)
async def create_milestone_route(
    body: CreateMilestoneRequest, _claims: dict = Depends(require_auth)
):
    async with get_session() as session:
        m = await create_milestone(
            session=session,
            domain=body.domain,
            name=body.name,
            description=body.description,
            order_index=body.order_index,
        )
        return MilestoneResponse(
            id=str(m.id), domain=m.domain, name=m.name,
            description=m.description, order_index=m.order_index,
        )


@router.get("/learner/{learner_id}", response_model=list[LearnerMilestoneResponse])
async def list_learner_milestones(
    learner_id: str,
    domain: str | None = None,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        lms = await get_learner_milestones(session, learner_id, domain=domain)
        return [
            LearnerMilestoneResponse(
                id=str(lm.id),
                learner_id=str(lm.learner_id),
                milestone_id=str(lm.milestone_id),
                status=lm.status,
                observations=lm.observations or [],
                last_observed_at=lm.last_observed_at.isoformat() if lm.last_observed_at else None,
            )
            for lm in lms
        ]


@router.post("/progress", response_model=LearnerMilestoneResponse)
async def update_progress(
    body: UpdateMilestoneStatusRequest, _claims: dict = Depends(require_auth)
):
    async with get_session() as session:
        lm = await update_milestone_status(
            session=session,
            learner_id=body.learner_id,
            milestone_id=body.milestone_id,
            status=body.status,
            observation=body.observation,
        )
        return LearnerMilestoneResponse(
            id=str(lm.id),
            learner_id=str(lm.learner_id),
            milestone_id=str(lm.milestone_id),
            status=lm.status,
            observations=lm.observations or [],
            last_observed_at=lm.last_observed_at.isoformat() if lm.last_observed_at else None,
        )
