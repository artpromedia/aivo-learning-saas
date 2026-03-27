"""Recommendation routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from brain_svc.db import get_session
from brain_svc.middleware.auth import require_auth
from brain_svc.services.recommendation import (
    create_recommendation,
    get_recommendation_by_id,
    get_recommendations,
    respond_to_recommendation,
)

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


class RecommendationResponse(BaseModel):
    id: str
    brain_state_id: str
    learner_id: str
    type: str
    title: str
    description: str
    payload: dict[str, Any] = Field(default_factory=dict)
    status: str
    parent_response_text: str | None = None
    responded_by: str | None = None
    responded_at: str | None = None
    re_trigger_gap_days: int = 14

    model_config = {"from_attributes": True}


class CreateRecommendationRequest(BaseModel):
    brain_state_id: str
    learner_id: str
    type: str
    title: str
    description: str
    payload: dict[str, Any] = Field(default_factory=dict)
    re_trigger_gap_days: int = 14


class RespondRequest(BaseModel):
    status: str  # APPROVED | DECLINED | ADJUSTED
    responded_by: str
    response_text: str | None = None


def _to_response(rec) -> RecommendationResponse:
    return RecommendationResponse(
        id=str(rec.id),
        brain_state_id=str(rec.brain_state_id),
        learner_id=str(rec.learner_id),
        type=rec.type,
        title=rec.title,
        description=rec.description,
        payload=rec.payload or {},
        status=rec.status,
        parent_response_text=rec.parent_response_text,
        responded_by=str(rec.responded_by) if rec.responded_by else None,
        responded_at=rec.responded_at.isoformat() if rec.responded_at else None,
        re_trigger_gap_days=rec.re_trigger_gap_days,
    )


@router.get("/learner/{learner_id}", response_model=list[RecommendationResponse])
async def list_recommendations(
    learner_id: str,
    status: str | None = None,
    type: str | None = None,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        recs = await get_recommendations(session, learner_id, status=status, rec_type=type)
        return [_to_response(r) for r in recs]


@router.get("/{recommendation_id}", response_model=RecommendationResponse)
async def get_recommendation(
    recommendation_id: str,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        rec = await get_recommendation_by_id(session, recommendation_id)
        if not rec:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        return _to_response(rec)


@router.post("/", response_model=RecommendationResponse, status_code=201)
async def create_new_recommendation(
    body: CreateRecommendationRequest,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        rec = await create_recommendation(
            session=session,
            brain_state_id=body.brain_state_id,
            learner_id=body.learner_id,
            rec_type=body.type,
            title=body.title,
            description=body.description,
            payload=body.payload,
            re_trigger_gap_days=body.re_trigger_gap_days,
        )
        return _to_response(rec)


@router.post("/{recommendation_id}/respond", response_model=RecommendationResponse)
async def respond_recommendation(
    recommendation_id: str,
    body: RespondRequest,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        rec = await get_recommendation_by_id(session, recommendation_id)
        if not rec:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        rec = await respond_to_recommendation(
            session=session,
            recommendation=rec,
            status=body.status,
            responded_by=body.responded_by,
            response_text=body.response_text,
        )
        return _to_response(rec)
