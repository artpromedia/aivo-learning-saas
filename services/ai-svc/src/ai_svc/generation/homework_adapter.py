"""Adapt homework assignments to learner's level."""

from __future__ import annotations

import logging
from typing import Any

from ai_svc.llm.gateway import LLMGateway
from ai_svc.prompts.assembler import PromptAssembler
from ai_svc.quality_gate.pipeline import QualityGatePipeline

logger = logging.getLogger(__name__)


class HomeworkAdapter:
    """Adapts homework content to match learner profile."""

    def __init__(self, gateway: LLMGateway) -> None:
        self._gateway = gateway
        self._assembler = PromptAssembler()
        self._quality_gate = QualityGatePipeline()

    async def adapt(
        self,
        learner_context: dict[str, Any],
        homework_text: str,
        subject: str,
        tenant_override: str | None = None,
    ) -> dict[str, Any]:
        """Adapt homework for the learner's current level."""
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
