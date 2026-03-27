"""Homework adaptation and OCR routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ai_svc.dependencies import get_gateway
from ai_svc.generation.homework_adapter import HomeworkAdapter
from ai_svc.vision.ocr_processor import OCRProcessor
from ai_svc.middleware.auth import require_auth

router = APIRouter(prefix="/ai/homework", tags=["homework"])


class HomeworkAdaptRequest(BaseModel):
    learner_context: dict[str, Any] = Field(default_factory=dict)
    homework_text: str
    subject: str
    tenant_override: str | None = None


class HomeworkOCRRequest(BaseModel):
    image_url: str | None = None
    image_base64: str | None = None


@router.post("/adapt")
async def adapt_homework(
    body: HomeworkAdaptRequest,
    _claims: dict = Depends(require_auth),
):
    gateway = get_gateway()
    adapter = HomeworkAdapter(gateway)
    result = await adapter.adapt(
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
    gateway = get_gateway()
    processor = OCRProcessor(gateway)
    result = await processor.process_image(
        image_url=body.image_url,
        image_base64=body.image_base64,
    )
    return result.to_dict()
