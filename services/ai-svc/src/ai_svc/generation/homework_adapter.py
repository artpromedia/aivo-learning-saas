"""Adapt homework assignments to learner's Brain profile.

Generates functioning-level-specific adaptations:
- STANDARD: Rephrase for clarity, add step-by-step scaffolding
- SUPPORTED: Simplify language, add visual cues, reduce choices to 3
- LOW_VERBAL: Picture-supported format, 2 choices, audio-first
- NON_VERBAL: Parent adaptation guide with real objects
- PRE_SYMBOLIC: Parent adaptation guide with sensory activities
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Any

from ai_svc.llm.gateway import LLMGateway
from ai_svc.prompts.assembler import PromptAssembler
from ai_svc.quality_gate.pipeline import QualityGatePipeline
from ai_svc.prompts.functioning_level_rules import (
    get_max_choices,
    get_max_sentences_per_block,
)

logger = logging.getLogger(__name__)


@dataclass
class AdaptedProblem:
    """A single adapted homework problem."""
    problem_number: int
    original: str
    adapted: str
    scaffolding: str = ""
    accommodation_notes: str = ""
    visual_supports: list[str] = field(default_factory=list)
    choices: list[str] = field(default_factory=list)
    parent_guide: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "problem_number": self.problem_number,
            "original": self.original,
            "adapted": self.adapted,
            "scaffolding": self.scaffolding,
            "accommodation_notes": self.accommodation_notes,
            "visual_supports": self.visual_supports,
            "choices": self.choices,
            "parent_guide": self.parent_guide,
        }


@dataclass
class AdaptedAssignment:
    """Full adapted homework assignment."""
    original_summary: str
    adapted_problems: list[AdaptedProblem]
    parent_guide: str = ""
    estimated_minutes: int = 15
    functioning_level: str = "STANDARD"
    quality_passed: bool = True
    model: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "original_summary": self.original_summary,
            "adapted_problems": [p.to_dict() for p in self.adapted_problems],
            "parent_guide": self.parent_guide,
            "estimated_minutes": self.estimated_minutes,
            "functioning_level": self.functioning_level,
            "quality_passed": self.quality_passed,
            "model": self.model,
        }


_ADAPTATION_PROMPT_TEMPLATE = """Adapt these homework problems for a learner with the following profile.

## Brain Context
- Functioning Level: {functioning_level}
- Communication Mode: {communication_mode}
- Grade Level: {grade_level}
- Active Accommodations: {accommodations}
- IEP Goals: {iep_goals}
- Delivery Level Parameters:
  - Max sentences per block: {max_sentences}
  - Max choices: {max_choices}

## Adaptation Rules for {functioning_level}
{adaptation_rules}

## Problems to Adapt
{problems_text}

## Required Output
Return a JSON object:
{{
  "original_summary": "Brief description of the original assignment",
  "adapted_problems": [
    {{
      "problem_number": 1,
      "original": "original problem text",
      "adapted": "adapted problem text at learner's level",
      "scaffolding": "worked examples, hints, or sentence starters",
      "accommodation_notes": "accommodations applied",
      "visual_supports": ["[PICTURE: description]", ...],
      "choices": ["simplified choices if MCQ"],
      "parent_guide": "guide for parent/caregiver if needed"
    }}
  ],
  "parent_guide": "overall guide for parent support (required for LOW_VERBAL, NON_VERBAL, PRE_SYMBOLIC)",
  "estimated_minutes": 15
}}

Return ONLY the JSON object."""


_ADAPTATION_RULES: dict[str, str] = {
    "STANDARD": (
        "- Rephrase for maximum clarity\n"
        "- Add step-by-step scaffolding for complex problems\n"
        "- Maintain original difficulty level\n"
        "- Add worked example for the first problem of each type"
    ),
    "SUPPORTED": (
        "- Simplify language to shorter sentences\n"
        "- Add visual cue descriptions [PICTURE: ...] for abstract concepts\n"
        "- Reduce MCQ choices to 3 maximum\n"
        "- Break multi-step problems into explicit numbered steps\n"
        "- Add sentence starters for open-ended questions\n"
        "- Use concrete examples before abstract representations"
    ),
    "LOW_VERBAL": (
        "- Convert ALL text to picture-supported format\n"
        "- Maximum 2 choices for any selection\n"
        "- Every instruction needs a [PICTURE: description] marker\n"
        "- Audio-first descriptions (describe for text-to-speech)\n"
        "- Touch/tap responses only - no typing required\n"
        "- Maximum 1 sentence per instruction\n"
        "- Use only concrete, tangible vocabulary (max 2-syllable words)"
    ),
    "NON_VERBAL": (
        "- Generate PARENT ADAPTATION GUIDE instead of student-facing content\n"
        "- Guide format: 'Here is how to adapt this worksheet using real objects'\n"
        "- Each problem becomes a real-world activity\n"
        "- Include: materials needed, setup steps, what to observe\n"
        "- Engagement metrics: looking, reaching, activating switch\n"
        "- Prompting hierarchy: wait -> gesture -> model -> physical assist"
    ),
    "PRE_SYMBOLIC": (
        "- Generate PARENT ADAPTATION GUIDE ONLY\n"
        "- Convert worksheet concepts to sensory/cause-effect activities\n"
        "- Each activity: 1-3 minutes maximum\n"
        "- Include: materials, setup, procedure, sensory considerations\n"
        "- Observation checklist: alertness, tracking, vocalization, preference\n"
        "- Include sensory break protocol between activities"
    ),
}


class HomeworkAdapter:
    """Adapts homework content to match learner's Brain profile."""

    def __init__(self, gateway: LLMGateway) -> None:
        self._gateway = gateway
        self._assembler = PromptAssembler()
        self._quality_gate = QualityGatePipeline()

    async def adapt(
        self,
        extracted_problems: list[dict[str, Any]],
        brain_context: dict[str, Any],
        subject: str,
        tenant_override: str | None = None,
    ) -> AdaptedAssignment:
        """Adapt homework problems for the learner's current level.

        Args:
            extracted_problems: List of extracted problem dicts from OCR.
            brain_context: Learner's Brain context (functioning level, accommodations, etc.).
            subject: Detected subject of the homework.
            tenant_override: Optional tenant-specific model override.

        Returns:
            AdaptedAssignment with original and adapted problems.
        """
        functioning_level = brain_context.get("functioning_level", "STANDARD")
        communication_mode = brain_context.get("communication_mode", "VERBAL")
        grade_level = brain_context.get("enrolled_grade", 5)
        accommodations = brain_context.get("active_accommodations", [])
        iep_goals = brain_context.get("iep_goals", [])

        max_sentences = get_max_sentences_per_block(functioning_level)
        max_choices = get_max_choices(functioning_level)

        # Build problems text for the prompt
        problems_text = self._format_problems(extracted_problems)

        # Build the adaptation prompt
        adaptation_rules = _ADAPTATION_RULES.get(functioning_level, _ADAPTATION_RULES["STANDARD"])
        prompt = _ADAPTATION_PROMPT_TEMPLATE.format(
            functioning_level=functioning_level,
            communication_mode=communication_mode,
            grade_level=grade_level,
            accommodations=", ".join(accommodations) if accommodations else "None",
            iep_goals=", ".join(iep_goals) if iep_goals else "None",
            max_sentences=max_sentences,
            max_choices=max_choices,
            adaptation_rules=adaptation_rules,
            problems_text=problems_text,
        )

        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"Adapt these {subject} homework problems."},
        ]

        response = await self._gateway.generate(
            messages=messages,
            task_type="homework_adapt",
            tenant_override=tenant_override,
        )

        # Parse the response
        assignment = self._parse_response(response.content, functioning_level)
        assignment.model = response.model
        assignment.functioning_level = functioning_level

        # Run quality gate on adapted content
        combined_adapted = "\n\n".join(p.adapted for p in assignment.adapted_problems)
        quality = self._quality_gate.validate(combined_adapted, brain_context)
        assignment.quality_passed = quality.passed

        if not quality.passed:
            logger.warning(
                "Homework adaptation failed quality gate for functioning_level=%s: %s",
                functioning_level,
                [g.details for g in quality.gates if not g.passed],
            )

        return assignment

    async def adapt_simple(
        self,
        learner_context: dict[str, Any],
        homework_text: str,
        subject: str,
        tenant_override: str | None = None,
    ) -> dict[str, Any]:
        """Simple adaptation for backward compatibility with existing route.

        Args:
            learner_context: Brain context dict.
            homework_text: Raw homework text.
            subject: Subject identifier.
            tenant_override: Optional model override.

        Returns:
            Dict with adapted_content, quality_passed, model, usage.
        """
        messages = self._assembler.assemble(
            session_type="homework",
            learner_context=learner_context,
            request_data={"text": homework_text, "subject": subject},
        )

        response = await self._gateway.generate(
            messages=messages,
            task_type="homework_adapt",
            tenant_override=tenant_override,
        )

        quality = self._quality_gate.validate(response.content, learner_context)

        return {
            "adapted_content": quality.content if quality.passed else response.content,
            "quality_passed": quality.passed,
            "model": response.model,
            "usage": {
                "prompt_tokens": response.prompt_tokens,
                "completion_tokens": response.completion_tokens,
                "total_tokens": response.total_tokens,
                "latency_ms": response.latency_ms,
            },
        }

    def _format_problems(self, problems: list[dict[str, Any]]) -> str:
        """Format extracted problems for the adaptation prompt."""
        parts: list[str] = []
        for i, p in enumerate(problems, 1):
            num = p.get("number", p.get("problem_number", i))
            text = p.get("problem_text", p.get("text", ""))
            ptype = p.get("problem_type", p.get("type", "SHORT_ANSWER"))
            choices = p.get("extracted_choices", p.get("choices", []))
            equations = p.get("detected_equations_latex", p.get("equations_latex", []))

            entry = f"Problem {num} (type: {ptype}):\n{text}"
            if choices:
                entry += "\nChoices: " + " | ".join(choices)
            if equations:
                entry += "\nEquations: " + ", ".join(equations)
            parts.append(entry)

        return "\n\n".join(parts)

    def _parse_response(self, response_text: str, functioning_level: str) -> AdaptedAssignment:
        """Parse the LLM adaptation response."""
        try:
            clean = response_text.strip()
            if clean.startswith("```"):
                lines = clean.split("\n")
                clean = "\n".join(lines[1:-1]) if len(lines) > 2 else clean
            data = json.loads(clean)
        except json.JSONDecodeError:
            logger.warning("Failed to parse adaptation JSON response")
            return AdaptedAssignment(
                original_summary="Failed to parse adaptation",
                adapted_problems=[],
            )

        adapted_problems: list[AdaptedProblem] = []
        for p in data.get("adapted_problems", []):
            adapted_problems.append(AdaptedProblem(
                problem_number=p.get("problem_number", len(adapted_problems) + 1),
                original=p.get("original", ""),
                adapted=p.get("adapted", ""),
                scaffolding=p.get("scaffolding", ""),
                accommodation_notes=p.get("accommodation_notes", ""),
                visual_supports=p.get("visual_supports", []),
                choices=p.get("choices", []),
                parent_guide=p.get("parent_guide", ""),
            ))

        return AdaptedAssignment(
            original_summary=data.get("original_summary", ""),
            adapted_problems=adapted_problems,
            parent_guide=data.get("parent_guide", ""),
            estimated_minutes=data.get("estimated_minutes", 15),
            functioning_level=functioning_level,
        )
