"""Writing coach feedback generation."""

from __future__ import annotations

import logging
from typing import Any

from ai_svc.llm.gateway import LLMGateway
from ai_svc.prompts.assembler import PromptAssembler
from ai_svc.quality_gate.pipeline import QualityGatePipeline

logger = logging.getLogger(__name__)


class WritingFeedbackGenerator:
    """Generates developmental writing feedback."""

    def __init__(self, gateway: LLMGateway) -> None:
        self._gateway = gateway
        self._assembler = PromptAssembler()
        self._quality_gate = QualityGatePipeline()

    async def generate_feedback(
        self,
        learner_context: dict[str, Any],
        submission: str,
        prompt_text: str = "",
        tenant_override: str | None = None,
    ) -> dict[str, Any]:
        """Generate writing feedback for a student submission."""
        messages = self._assembler.assemble(
            session_type="writing",
            learner_context=learner_context,
            request_data={"submission": submission, "prompt": prompt_text},
        )

        response = await self._gateway.generate(
            messages=messages,
            task_type="writing_feedback",
            tenant_override=tenant_override,
        )

        quality = self._quality_gate.validate(response.content, learner_context)

        return {
            "feedback": quality.content if quality.passed else response.content,
            "quality_passed": quality.passed,
            "model": response.model,
            "usage": {
                "prompt_tokens": response.prompt_tokens,
                "completion_tokens": response.completion_tokens,
                "total_tokens": response.total_tokens,
                "latency_ms": response.latency_ms,
            },
        }
