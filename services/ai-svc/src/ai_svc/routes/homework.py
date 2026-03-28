"""Homework adaptation and OCR routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, UploadFile, File, Form
from pydantic import BaseModel, Field

from ai_svc.dependencies import get_gateway
from ai_svc.generation.homework_adapter import HomeworkAdapter
from ai_svc.vision.ocr_processor import OCRProcessor
from ai_svc.middleware.auth import require_auth

router = APIRouter(prefix="/ai/homework", tags=["homework"])


class HomeworkAdaptRequest(BaseModel):
    learner_context: dict[str, Any] = Field(default_factory=dict)
    homework_text: str = ""
    subject: str = "math"
    tenant_override: str | None = None
    extracted_problems: list[dict[str, Any]] = Field(default_factory=list)
    brain_context: dict[str, Any] = Field(default_factory=dict)


class HomeworkOCRRequest(BaseModel):
    image_url: str | None = None
    image_base64: str | None = None


@router.post("/adapt")
async def adapt_homework(
    body: HomeworkAdaptRequest,
    _claims: dict = Depends(require_auth),
):
    """Adapt homework problems to learner's Brain profile.

    If extracted_problems + brain_context are provided, uses the full
    adaptation engine with functioning-level-specific output.
    Otherwise falls back to the simple text-based adaptation.
    """
    gateway = get_gateway()
    adapter = HomeworkAdapter(gateway)

    if body.extracted_problems and body.brain_context:
        assignment = await adapter.adapt(
            extracted_problems=body.extracted_problems,
            brain_context=body.brain_context,
            subject=body.subject,
            tenant_override=body.tenant_override,
        )
        return assignment.to_dict()

    result = await adapter.adapt_simple(
        learner_context=body.learner_context,
        homework_text=body.homework_text,
        subject=body.subject,
        tenant_override=body.tenant_override,
    )
    return result


@router.post("/ocr")
async def homework_ocr(
    body: HomeworkOCRRequest,
    _claims: dict = Depends(require_auth),
):
    """OCR extraction from a homework image URL or base64."""
    gateway = get_gateway()
    processor = OCRProcessor(gateway)
    result = await processor.extract(
        image_url=body.image_url,
        image_bytes=None,
    )
    return result.to_dict()
