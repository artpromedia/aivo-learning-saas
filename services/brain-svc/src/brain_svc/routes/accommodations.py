"""Accommodation routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from brain_svc.db import get_session
from brain_svc.middleware.auth import require_auth
from brain_svc.services.accommodation import diff_accommodations, resolve_accommodations
from brain_svc.services.brain_state import get_brain_state, update_brain_state

router = APIRouter(prefix="/accommodations", tags=["accommodations"])


class ResolveAccommodationsRequest(BaseModel):
    sources: dict[str, list[str]] = Field(default_factory=dict)


class UpdateAccommodationsRequest(BaseModel):
    learner_id: str
    sources: dict[str, list[str]] = Field(default_factory=dict)


@router.post("/resolve")
async def resolve_route(
    body: ResolveAccommodationsRequest,
    _claims: dict = Depends(require_auth),
):
    result = resolve_accommodations(body.sources)
    return {"accommodations": result}


@router.post("/apply")
async def apply_accommodations(
    body: UpdateAccommodationsRequest,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        bs = await get_brain_state(session, body.learner_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")

        new_accommodations = resolve_accommodations(body.sources)
        current = (bs.state or {}).get("active_accommodations", [])
        diff = diff_accommodations(current, new_accommodations)

        state = dict(bs.state or {})
        state["active_accommodations"] = new_accommodations
        await update_brain_state(session, bs, {"state": state})

        return {"accommodations": new_accommodations, "diff": diff}


@router.get("/learner/{learner_id}")
async def get_learner_accommodations(
    learner_id: str,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        bs = await get_brain_state(session, learner_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        return {
            "learner_id": learner_id,
            "accommodations": (bs.state or {}).get("active_accommodations", []),
        }
