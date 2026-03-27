"""Generate full adaptive lessons tailored to learner context."""

from __future__ import annotations

import logging
from typing import Any

from ai_svc.llm.gateway import LLMGateway, LLMResponse
from ai_svc.llm.tier_router import Tier
from ai_svc.prompts.assembler import PromptAssembler
from ai_svc.quality_gate.pipeline import QualityGatePipeline

logger = logging.getLogger(__name__)


class LessonGenerator:
    """Generates adaptive lessons using 3-layer prompt assembly + quality gate."""

    def __init__(self, gateway: LLMGateway) -> None:
        self._gateway = gateway
        self._assembler = PromptAssembler()
        self._quality_gate = QualityGatePipeline()

    async def generate(
        self,
        learner_context: dict[str, Any],
        subject: str,
        skill: str,
        grade: int,
        mastery_gaps: list[str] | None = None,
        tutor_persona: str | None = None,
        curriculum_standards: list[str] | None = None,
        tenant_override: str | None = None,
    ) -> dict[str, Any]:
        """Generate a complete adaptive lesson.

        Returns dict with content, quality result, and usage stats.
        """
        messages = self._assembler.assemble(
            session_type="lesson",
            learner_context=learner_context,
            request_data={
                "subject": subject,
                "skill": skill,
                "grade": grade,
                "mastery_gaps": mastery_gaps or [],
            },
            tutor_persona=tutor_persona,
            curriculum_standards=curriculum_standards,
        )

        response = await self._gateway.generate(
            messages=messages,
            task_type="lesson_generation",
            tenant_override=tenant_override,
        )

        quality = self._quality_gate.validate(response.content, learner_context)

        return {
            "content": quality.content if quality.passed else response.content,
            "quality_result": {
                "passed": quality.passed,
                "gates": [
                    {"name": g.name, "passed": g.passed, "details": g.details}
                    for g in quality.gates
                ],
            },
            "model": response.model,
            "usage": {
                "prompt_tokens": response.prompt_tokens,
                "completion_tokens": response.completion_tokens,
                "total_tokens": response.total_tokens,
                "latency_ms": response.latency_ms,
            },
        }
