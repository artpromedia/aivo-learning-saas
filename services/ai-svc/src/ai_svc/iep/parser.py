"""LLM-based IEP document parsing pipeline."""

from __future__ import annotations

import json
import logging
from typing import Any

from ai_svc.llm.gateway import LLMGateway
from ai_svc.llm.tier_router import Tier
from ai_svc.iep.extractor import Accommodation, IEPExtraction, IEPGoal

logger = logging.getLogger(__name__)

_IEP_EXTRACTION_PROMPT = """You are an expert IEP (Individualized Education Program) document analyzer.

Extract the following structured information from the IEP document text provided.
Be thorough and accurate. If a field is not found in the document, use null.

Return your response as a JSON object with exactly these fields:
{
  "disability_categories": ["list of disability categories mentioned"],
  "accommodations": [
    {"name": "accommodation name", "description": "what it entails", "category": "category"}
  ],
  "goals": [
    {
      "goal_text": "the full goal text",
      "domain": "MATH|ELA|SCIENCE|COMMUNICATION|SELF_CARE|SOCIAL_EMOTIONAL|PRE_ACADEMIC|MOTOR_SENSORY",
      "target_metric": "how progress is measured",
      "target_value": "target level or percentage",
      "timeline": "expected timeline"
    }
  ],
  "grade_level": null or integer,
  "communication_system": null or "PECs|AAC device|sign language|verbal|other",
  "assistive_technology": ["list of AT devices/tools mentioned"],
  "recommended_functioning_level": null or "STANDARD|SUPPORTED|LOW_VERBAL|NON_VERBAL|PRE_SYMBOLIC"
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no explanation."""


class IEPParser:
    """Parses IEP documents using LLM extraction."""

    def __init__(self, gateway: LLMGateway) -> None:
        self._gateway = gateway

    async def parse_text(self, text: str) -> IEPExtraction:
        """Parse extracted IEP text into structured data."""
        messages = [
            {"role": "system", "content": _IEP_EXTRACTION_PROMPT},
            {"role": "user", "content": f"IEP Document Text:\n\n{text}"},
        ]

        response = await self._gateway.generate(
            messages=messages,
            task_type="iep_parse",
            tier=Tier.REASONING,
            temperature=0.1,
            max_tokens=4096,
        )

        return self._parse_response(response.content, text)

    async def parse_pdf(self, pdf_bytes: bytes) -> IEPExtraction:
        """Parse an IEP PDF document."""
        from pypdf import PdfReader
        import io

        reader = PdfReader(io.BytesIO(pdf_bytes))
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

        full_text = "\n\n".join(text_parts)
        if not full_text.strip():
            return IEPExtraction(raw_text="")

        return await self.parse_text(full_text)

    async def parse_image(self, image_url: str) -> IEPExtraction:
        """Parse an IEP from an image using Vision AI + LLM extraction."""
        # First, OCR the image
        vision_messages = [
            {"role": "system", "content": "Extract all text from this IEP document image. Return the complete text content."},
            {"role": "user", "content": "Extract all text from this document."},
        ]

        ocr_response = await self._gateway.generate_with_vision(
            messages=vision_messages,
            image_url=image_url,
        )

        if not ocr_response.content.strip():
            return IEPExtraction(raw_text="")

        return await self.parse_text(ocr_response.content)

    def _parse_response(self, response_text: str, original_text: str) -> IEPExtraction:
        """Parse LLM JSON response into IEPExtraction."""
        try:
            # Strip markdown code blocks if present
            clean = response_text.strip()
            if clean.startswith("```"):
                lines = clean.split("\n")
                clean = "\n".join(lines[1:-1]) if len(lines) > 2 else clean

            data = json.loads(clean)
        except json.JSONDecodeError:
            logger.warning("Failed to parse IEP extraction JSON, returning empty extraction")
            return IEPExtraction(raw_text=original_text)

        accommodations = [
            Accommodation(
                name=a.get("name", ""),
                description=a.get("description", ""),
                category=a.get("category", ""),
            )
            for a in data.get("accommodations", [])
        ]

        goals = [
            IEPGoal(
                goal_text=g.get("goal_text", ""),
                domain=g.get("domain", ""),
                target_metric=g.get("target_metric", ""),
                target_value=g.get("target_value", ""),
                timeline=g.get("timeline", ""),
            )
            for g in data.get("goals", [])
        ]

        return IEPExtraction(
            disability_categories=data.get("disability_categories", []),
            accommodations=accommodations,
            goals=goals,
            grade_level=data.get("grade_level"),
            communication_system=data.get("communication_system"),
            assistive_technology=data.get("assistive_technology", []),
            recommended_functioning_level=data.get("recommended_functioning_level"),
            raw_text=original_text,
        )
