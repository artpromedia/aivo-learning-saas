"""Vision AI extraction routes."""

from __future__ import annotations

import base64
from typing import Any

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel

from ai_svc.dependencies import get_gateway
from ai_svc.middleware.auth import require_auth
from ai_svc.vision.ocr_processor import OCRProcessor

router = APIRouter(prefix="/ai/vision", tags=["vision"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

ALLOWED_IMAGE_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff",
}
ALLOWED_PDF_TYPES = {"application/pdf"}
ALLOWED_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_PDF_TYPES


@router.post("/extract")
async def extract_document(
    file: UploadFile = File(...),
    _claims: dict = Depends(require_auth),
):
    """Extract structured content from a homework image or PDF.

    Accepts multipart file upload. Returns ExtractedDocument with:
    - raw_text, detected_subject, list of problems with types and equations.
    """
    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}. Allowed: images and PDF.",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB.",
        )

    gateway = get_gateway()
    processor = OCRProcessor(gateway)

    if content_type in ALLOWED_PDF_TYPES:
        result = await processor.extract(pdf_bytes=file_bytes)
    else:
        result = await processor.extract(
            image_bytes=file_bytes,
            mime_type=content_type,
        )

    return result.to_dict()


class VisionExtractURLRequest(BaseModel):
    """Request to extract from an image URL."""
    image_url: str
    mime_type: str = "image/jpeg"


@router.post("/extract-url")
async def extract_from_url(
    body: VisionExtractURLRequest,
    _claims: dict = Depends(require_auth),
):
    """Extract structured content from a hosted image URL."""
    gateway = get_gateway()
    processor = OCRProcessor(gateway)
    result = await processor.extract(image_url=body.image_url)
    return result.to_dict()
