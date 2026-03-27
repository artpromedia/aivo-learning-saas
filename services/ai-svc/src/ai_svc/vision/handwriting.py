"""Handwriting recognition via Vision AI."""

from __future__ import annotations

from typing import Any

from ai_svc.llm.gateway import LLMGateway


_HANDWRITING_PROMPT = """Extract the handwritten text from this image.
Return only the transcribed text, preserving line breaks.
If you see math notation, convert to LaTeX format.
If text is illegible, indicate with [illegible]."""


async def recognize_handwriting(
    gateway: LLMGateway,
    image_url: str | None = None,
    image_base64: str | None = None,
) -> str:
    """Recognize handwritten text from an image."""
    messages = [
        {"role": "system", "content": _HANDWRITING_PROMPT},
        {"role": "user", "content": "Transcribe the handwriting in this image."},
    ]

    response = await gateway.generate_with_vision(
        messages=messages,
        image_url=image_url,
        image_base64=image_base64,
    )
    return response.content
