"""Tutor registry routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from brain_svc.db import get_session
from brain_svc.middleware.auth import require_auth
from brain_svc.services.brain_state import get_brain_state
from brain_svc.services.tutor_registry import (
    activate_tutor,
    deactivate_tutor,
    get_active_tutors,
)

router = APIRouter(prefix="/tutors", tags=["tutors"])


class ActivateTutorRequest(BaseModel):
    learner_id: str
    tutor_id: str
    tutor_type: str
    subject: str | None = None


class DeactivateTutorRequest(BaseModel):
    learner_id: str
    tutor_id: str


@router.get("/learner/{learner_id}")
async def list_active_tutors(learner_id: str, _claims: dict = Depends(require_auth)):
    async with get_session() as session:
        bs = await get_brain_state(session, learner_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        tutors = await get_active_tutors(bs)
        return {"learner_id": learner_id, "active_tutors": tutors}


@router.post("/activate")
async def activate_tutor_route(body: ActivateTutorRequest, _claims: dict = Depends(require_auth)):
    async with get_session() as session:
        bs = await get_brain_state(session, body.learner_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        tutors = await activate_tutor(
            session=session,
            brain_state=bs,
            tutor_id=body.tutor_id,
            tutor_type=body.tutor_type,
            subject=body.subject,
        )
        return {"learner_id": body.learner_id, "active_tutors": tutors}


@router.post("/deactivate")
async def deactivate_tutor_route(
    body: DeactivateTutorRequest, _claims: dict = Depends(require_auth)
):
    async with get_session() as session:
        bs = await get_brain_state(session, body.learner_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        tutors = await deactivate_tutor(session=session, brain_state=bs, tutor_id=body.tutor_id)
        return {"learner_id": body.learner_id, "active_tutors": tutors}
