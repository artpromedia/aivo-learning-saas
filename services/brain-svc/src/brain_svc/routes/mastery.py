"""Mastery routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from brain_svc.db import get_session
from brain_svc.middleware.auth import require_auth
from brain_svc.ml.model_store import ModelStore
from brain_svc.config import get_settings
from brain_svc.services.brain_state import get_brain_state
from brain_svc.services.mastery import (
    detect_regression,
    process_batch_mastery_update,
    process_mastery_update,
)

router = APIRouter(prefix="/mastery", tags=["mastery"])

_model_store: ModelStore | None = None


def _get_model_store() -> ModelStore:
    global _model_store
    if _model_store is None:
        _model_store = ModelStore(get_settings().model_store_dir)
    return _model_store


class MasteryUpdateRequest(BaseModel):
    learner_id: str
    skill: str
    is_correct: bool
    difficulty: float = 0.5
    session_id: str | None = None


class BatchMasteryRequest(BaseModel):
    learner_id: str
    session_id: str | None = None
    interactions: list[dict[str, Any]] = Field(default_factory=list)


class MasteryUpdateResponse(BaseModel):
    skill: str
    previous_level: float
    new_level: float
    delta: float


@router.post("/update", response_model=MasteryUpdateResponse)
async def update_mastery(
    body: MasteryUpdateRequest,
    _claims: dict = Depends(require_auth),
):
    model_store = _get_model_store()
    async with get_session() as session:
        bs = await get_brain_state(session, body.learner_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        result = await process_mastery_update(
            session=session,
            model_store=model_store,
            brain_state=bs,
            skill=body.skill,
            is_correct=body.is_correct,
            difficulty=body.difficulty,
            session_id=body.session_id,
        )
        return MasteryUpdateResponse(
            skill=result.skill,
            previous_level=result.previous_level,
            new_level=result.new_level,
            delta=result.delta,
        )


@router.post("/batch-update", response_model=list[MasteryUpdateResponse])
async def batch_update_mastery(
    body: BatchMasteryRequest,
    _claims: dict = Depends(require_auth),
):
    model_store = _get_model_store()
    async with get_session() as session:
        bs = await get_brain_state(session, body.learner_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        results = await process_batch_mastery_update(
            session=session,
            model_store=model_store,
            brain_state=bs,
            interactions=body.interactions,
            session_id=body.session_id,
        )
        return [
            MasteryUpdateResponse(
                skill=r.skill,
                previous_level=r.previous_level,
                new_level=r.new_level,
                delta=r.delta,
            )
            for r in results
        ]


@router.get("/learner/{learner_id}")
async def get_mastery_levels(
    learner_id: str,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        bs = await get_brain_state(session, learner_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        state = bs.state or {}
        return {
            "learner_id": learner_id,
            "mastery_levels": state.get("mastery_levels", {}),
            "domain_scores": state.get("domain_scores", {}),
        }
