"""Vision AI homework OCR processor."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from ai_svc.llm.gateway import LLMGateway

logger = logging.getLogger(__name__)

_OCR_SYSTEM_PROMPT = """You are a homework OCR and analysis expert. Extract ALL content from the homework image.

Return a JSON object with:
{
  "printed_text": "all printed text found",
  "handwritten_text": "all handwritten text found",
  "math_equations": ["LaTeX format equations found"],
  "tables": [{"headers": [...], "rows": [[...]]}],
  "diagrams": ["description of each diagram"],
  "subject": "auto-detected subject (MATH|ELA|SCIENCE|HISTORY|OTHER)",
  "problems": [
    {
      "number": 1,
      "text": "problem text",
      "student_answer": "what the student wrote (if visible)",
      "type": "multiple_choice|short_answer|essay|equation|diagram"
    }
  ]
}

Return ONLY the JSON object."""


@dataclass
class HomeworkExtraction:
    """Structured extraction from homework image."""
    printed_text: str = ""
    handwritten_text: str = ""
    math_equations: list[str] = field(default_factory=list)
    tables: list[dict[str, Any]] = field(default_factory=list)
    diagrams: list[str] = field(default_factory=list)
    subject: str = "OTHER"
    problems: list[dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "printed_text": self.printed_text,
            "handwritten_text": self.handwritten_text,
            "math_equations": self.math_equations,
            "tables": self.tables,
            "diagrams": self.diagrams,
            "subject": self.subject,
            "problems": self.problems,
        }


class OCRProcessor:
    """Processes homework images using Vision AI."""

    def __init__(self, gateway: LLMGateway) -> None:
        self._gateway = gateway

    async def process_image(
        self,
        image_url: str | None = None,
        image_base64: str | None = None,
    ) -> HomeworkExtraction:
        """Extract text and structure from a homework image."""
        messages = [
            {"role": "system", "content": _OCR_SYSTEM_PROMPT},
            {"role": "user", "content": "Extract all content from this homework image."},
        ]

        response = await self._gateway.generate_with_vision(
            messages=messages,
            image_url=image_url,
            image_base64=image_base64,
        )

        return self._parse_extraction(response.content)

    async def process_pdf(self, pdf_bytes: bytes) -> HomeworkExtraction:
        """Extract text from a homework PDF."""
        from pypdf import PdfReader
        import io

        reader = PdfReader(io.BytesIO(pdf_bytes))
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

        full_text = "\n\n".join(text_parts)
        return HomeworkExtraction(
            printed_text=full_text,
            subject=self._detect_subject(full_text),
        )

    def _parse_extraction(self, response_text: str) -> HomeworkExtraction:
        """Parse LLM response into HomeworkExtraction."""
        import json
        try:
            clean = response_text.strip()
            if clean.startswith("```"):
                lines = clean.split("\n")
                clean = "\n".join(lines[1:-1]) if len(lines) > 2 else clean
            data = json.loads(clean)
        except json.JSONDecodeError:
            logger.warning("Failed to parse OCR extraction JSON")
            return HomeworkExtraction(printed_text=response_text)

        return HomeworkExtraction(
            printed_text=data.get("printed_text", ""),
            handwritten_text=data.get("handwritten_text", ""),
            math_equations=data.get("math_equations", []),
            tables=data.get("tables", []),
            diagrams=data.get("diagrams", []),
            subject=data.get("subject", "OTHER"),
            problems=data.get("problems", []),
        )

    def _detect_subject(self, text: str) -> str:
        """Simple subject detection from text content."""
        text_lower = text.lower()
        if any(w in text_lower for w in ["equation", "solve", "calculate", "x =", "algebra", "fraction"]):
            return "MATH"
        if any(w in text_lower for w in ["read", "write", "paragraph", "essay", "vocabulary", "grammar"]):
            return "ELA"
        if any(w in text_lower for w in ["experiment", "hypothesis", "molecule", "cell", "energy"]):
            return "SCIENCE"
        if any(w in text_lower for w in ["history", "war", "president", "century", "civilization"]):
            return "HISTORY"
        return "OTHER"
