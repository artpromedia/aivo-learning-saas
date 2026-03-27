"""IEP document parsing routes."""

from __future__ import annotations

import base64
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ai_svc.dependencies import get_gateway
from ai_svc.iep.parser import IEPParser
from ai_svc.middleware.auth import require_auth
from ai_svc.nats_client import publish_event

router = APIRouter(prefix="/ai/iep", tags=["iep"])


class IEPParseRequest(BaseModel):
    learner_id: str
    document_id: str
    file_url: str | None = None
    file_type: str = "pdf"
    text_content: str | None = None
    pdf_base64: str | None = None


@router.post("/parse")
async def parse_iep(
    body: IEPParseRequest,
    _claims: dict = Depends(require_auth),
):
    gateway = get_gateway()
    parser = IEPParser(gateway)

    if body.text_content:
        extraction = await parser.parse_text(body.text_content)
    elif body.pdf_base64:
        pdf_bytes = base64.b64decode(body.pdf_base64)
        extraction = await parser.parse_pdf(pdf_bytes)
    elif body.file_url and body.file_type in ("png", "jpg", "jpeg", "image"):
        extraction = await parser.parse_image(body.file_url)
    elif body.file_url:
        # For URL-based PDFs, use text content if available
        extraction = await parser.parse_image(body.file_url)
    else:
        return {"error": "No parseable content provided"}

    result = extraction.to_dict()

    # Publish parsed event
    try:
        await publish_event("aivo.assessment.iep.parsed", {
            "learnerId": body.learner_id,
            "documentId": body.document_id,
            "parsedData": result,
        })
    except Exception:
        pass  # Non-critical — NATS may not be available

    return {"learner_id": body.learner_id, "document_id": body.document_id, **result}
