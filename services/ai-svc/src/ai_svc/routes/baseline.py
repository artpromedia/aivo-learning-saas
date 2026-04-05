"""Baseline assessment question generation route."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ai_svc.dependencies import get_gateway
from ai_svc.generation.baseline_question_generator import BaselineQuestionGenerator
from ai_svc.middleware.auth import require_auth

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["baseline"])


class BaselineQuestionRequest(BaseModel):
    parent_assessment: dict[str, Any] = Field(
        description="Raw parent assessment responses (comm_verbal, interests, etc.)",
    )
    functioning_level: str = Field(default="STANDARD")
    assessment_mode: str = Field(default="STANDARD")
    theta: float = Field(default=0.0, description="Current IRT ability estimate")
    target_domain: str = Field(default="MATH")
    administered_items: list[dict[str, Any]] = Field(
        default_factory=list,
        description="Previously administered items (domain + skill)",
    )
    question_number: int = Field(default=1)
    iep_profile: dict[str, Any] | None = Field(
        default=None,
        description="Parsed IEP data (goals, accommodations, strengths, concerns, gradeLevel, etc.)",
    )


@router.post("/baseline/generate-question")
async def generate_baseline_question(
    body: BaselineQuestionRequest,
    _claims: dict = Depends(require_auth),
):
    gateway = get_gateway()
    gen = BaselineQuestionGenerator(gateway)

    question = await gen.generate(
        parent_assessment=body.parent_assessment,
        functioning_level=body.functioning_level,
        assessment_mode=body.assessment_mode,
        theta=body.theta,
        target_domain=body.target_domain,
        administered_items=body.administered_items,
        question_number=body.question_number,
        iep_profile=body.iep_profile,
    )

    return {"question": question}
