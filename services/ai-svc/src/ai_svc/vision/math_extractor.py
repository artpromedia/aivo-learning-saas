"""Math equation extraction — image to LaTeX."""

from __future__ import annotations

from typing import Any

from ai_svc.llm.gateway import LLMGateway


_MATH_EXTRACT_PROMPT = """Extract all mathematical expressions and equations from this image.
Convert each to LaTeX format.
Return as a JSON array of strings, e.g.: ["x^2 + 2x + 1 = 0", "\\frac{3}{4} + \\frac{1}{2}"]
Return ONLY the JSON array."""


async def extract_math_equations(
    gateway: LLMGateway,
    image_url: str | None = None,
    image_base64: str | None = None,
) -> list[str]:
    """Extract math equations from an image as LaTeX."""
    import json

    messages = [
        {"role": "system", "content": _MATH_EXTRACT_PROMPT},
        {"role": "user", "content": "Extract math equations from this image."},
    ]

    response = await gateway.generate_with_vision(
        messages=messages,
        image_url=image_url,
        image_base64=image_base64,
    )

    try:
        clean = response.content.strip()
        if clean.startswith("```"):
            lines = clean.split("\n")
            clean = "\n".join(lines[1:-1]) if len(lines) > 2 else clean
        return json.loads(clean)
    except (json.JSONDecodeError, TypeError):
        return [response.content] if response.content.strip() else []
