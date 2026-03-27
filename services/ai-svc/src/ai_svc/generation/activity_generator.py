"""Low-functioning activity guide generation."""

from __future__ import annotations

import logging
from typing import Any

from ai_svc.llm.gateway import LLMGateway
from ai_svc.prompts.assembler import PromptAssembler
from ai_svc.quality_gate.pipeline import QualityGatePipeline

logger = logging.getLogger(__name__)


class ActivityGenerator:
    """Generates structured activity guides for functional curriculum domains."""

    def __init__(self, gateway: LLMGateway) -> None:
        self._gateway = gateway
        self._assembler = PromptAssembler()
        self._quality_gate = QualityGatePipeline()

    async def generate(
        self,
        learner_context: dict[str, Any],
        domain: str,
        tenant_override: str | None = None,
    ) -> dict[str, Any]:
        """Generate an activity guide for a functional domain."""
        messages = self._assembler.assemble(
            session_type="activity",
            learner_context=learner_context,
            request_data={"domain": domain},
        )

        response = await self._gateway.generate(
            messages=messages,
            task_type="activity_generation",
            tenant_override=tenant_override,
        )

        quality = self._quality_gate.validate(response.content, learner_context)

        return {
            "activity_guide": quality.content if quality.passed else response.content,
            "quality_passed": quality.passed,
            "model": response.model,
            "usage": {
                "prompt_tokens": response.prompt_tokens,
                "completion_tokens": response.completion_tokens,
                "total_tokens": response.total_tokens,
                "latency_ms": response.latency_ms,
            },
        }
