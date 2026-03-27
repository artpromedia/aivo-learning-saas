"""Brain state routes — CRUD for learner brain states."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.db import get_session
from brain_svc.middleware.auth import require_auth
from brain_svc.services.brain_state import (
    delete_brain_state,
    get_brain_state,
    get_brain_state_by_id,
    update_brain_state,
)

router = APIRouter(prefix="/brain", tags=["brain"])


class BrainStateResponse(BaseModel):
    id: str
    learner_id: str
    main_brain_version: str | None = None
    seed_version: str | None = None
    state: dict[str, Any] = Field(default_factory=dict)
    functioning_level_profile: dict[str, Any] | None = None
    iep_profile: dict[str, Any] | None = None
    active_tutors: list[dict[str, Any]] | None = None
    delivery_levels: dict[str, Any] | None = None
    preferred_modality: str | None = None
    attention_span_minutes: int | None = None
    cognitive_load: str | None = None

    model_config = {"from_attributes": True}


class BrainStateUpdateRequest(BaseModel):
    state: dict[str, Any] | None = None
    preferred_modality: str | None = None
    attention_span_minutes: int | None = None
    cognitive_load: str | None = None


def _to_response(bs) -> BrainStateResponse:
    return BrainStateResponse(
        id=str(bs.id),
        learner_id=str(bs.learner_id),
        main_brain_version=bs.main_brain_version,
        seed_version=bs.seed_version,
        state=bs.state or {},
        functioning_level_profile=bs.functioning_level_profile,
        iep_profile=bs.iep_profile,
        active_tutors=bs.active_tutors,
        delivery_levels=bs.delivery_levels,
        preferred_modality=bs.preferred_modality,
        attention_span_minutes=bs.attention_span_minutes,
        cognitive_load=bs.cognitive_load,
    )


@router.get("/learner/{learner_id}", response_model=BrainStateResponse)
async def get_learner_brain(
    learner_id: str,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        bs = await get_brain_state(session, learner_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        return _to_response(bs)


@router.get("/{brain_state_id}", response_model=BrainStateResponse)
async def get_brain_by_id(
    brain_state_id: str,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        bs = await get_brain_state_by_id(session, brain_state_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        return _to_response(bs)


@router.patch("/{brain_state_id}", response_model=BrainStateResponse)
async def patch_brain_state(
    brain_state_id: str,
    body: BrainStateUpdateRequest,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        bs = await get_brain_state_by_id(session, brain_state_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        updates = body.model_dump(exclude_none=True)
        if updates:
            bs = await update_brain_state(session, bs, updates)
        return _to_response(bs)


@router.delete("/{brain_state_id}", status_code=204)
async def remove_brain_state(
    brain_state_id: str,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        bs = await get_brain_state_by_id(session, brain_state_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        await delete_brain_state(session, bs)
