"""Writing feedback routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ai_svc.dependencies import get_gateway
from ai_svc.generation.writing_feedback import WritingFeedbackGenerator
from ai_svc.middleware.auth import require_auth

router = APIRouter(prefix="/ai/writing", tags=["writing"])


class WritingFeedbackRequest(BaseModel):
    learner_context: dict[str, Any] = Field(default_factory=dict)
    submission: str
    prompt: str = ""
    tenant_override: str | None = None


@router.post("/feedback")
async def writing_feedback(
    body: WritingFeedbackRequest,
    _claims: dict = Depends(require_auth),
):
    gateway = get_gateway()
    gen = WritingFeedbackGenerator(gateway)
    result = await gen.generate_feedback(
        learner_context=body.learner_context,
        submission=body.submission,
        prompt_text=body.prompt,
        tenant_override=body.tenant_override,
    )
    return result
