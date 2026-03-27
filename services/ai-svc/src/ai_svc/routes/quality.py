"""Quality gate validation routes (internal)."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ai_svc.quality_gate.pipeline import QualityGatePipeline
from ai_svc.middleware.auth import require_auth

router = APIRouter(prefix="/ai/quality", tags=["quality"])


class ValidateRequest(BaseModel):
    content: str
    learner_context: dict[str, Any] = Field(default_factory=dict)


@router.post("/validate")
async def validate_content(
    body: ValidateRequest,
    _claims: dict = Depends(require_auth),
):
    pipeline = QualityGatePipeline()
    result = pipeline.validate(body.content, body.learner_context)
    return {
        "passed": result.passed,
        "gates": [
            {"name": g.name, "passed": g.passed, "details": g.details}
            for g in result.gates
        ],
        "content": result.content,
    }
