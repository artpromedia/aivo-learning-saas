"""Tutor response routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ai_svc.dependencies import get_gateway
from ai_svc.generation.tutor_responder import TutorResponder
from ai_svc.middleware.auth import require_auth

router = APIRouter(prefix="/ai/tutor", tags=["tutor"])


class TutorRequest(BaseModel):
    learner_context: dict[str, Any] = Field(default_factory=dict)
    subject: str
    user_input: str
    conversation_history: list[dict[str, str]] = Field(default_factory=list)
    tutor_persona: str | None = None
    tenant_override: str | None = None


@router.post("/respond")
async def tutor_respond(
    body: TutorRequest,
    _claims: dict = Depends(require_auth),
):
    gateway = get_gateway()
    responder = TutorResponder(gateway)
    result = await responder.respond(
        learner_context=body.learner_context,
        subject=body.subject,
        user_input=body.user_input,
        conversation_history=body.conversation_history or None,
        tutor_persona=body.tutor_persona,
        tenant_override=body.tenant_override,
    )
    return result
