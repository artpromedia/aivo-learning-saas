"""Generate quizzes from mastery gaps."""

from __future__ import annotations

import logging
from typing import Any

from ai_svc.llm.gateway import LLMGateway
from ai_svc.prompts.assembler import PromptAssembler
from ai_svc.quality_gate.pipeline import QualityGatePipeline

logger = logging.getLogger(__name__)


class QuizGenerator:
    """Generates adaptive quizzes targeting mastery gaps."""

    def __init__(self, gateway: LLMGateway) -> None:
        self._gateway = gateway
        self._assembler = PromptAssembler()
        self._quality_gate = QualityGatePipeline()

    async def generate(
        self,
        learner_context: dict[str, Any],
        subject: str,
        skills: list[str],
        num_questions: int = 5,
        tenant_override: str | None = None,
    ) -> dict[str, Any]:
        """Generate a quiz targeting specific skills."""
        messages = self._assembler.assemble(
            session_type="quiz",
            learner_context=learner_context,
            request_data={
                "subject": subject,
                "skills": skills,
                "num_questions": num_questions,
            },
        )

        response = await self._gateway.generate(
            messages=messages,
            task_type="quiz_generation",
            tenant_override=tenant_override,
            temperature=0.5,
        )

        quality = self._quality_gate.validate(response.content, learner_context)

        return {
            "quiz_content": quality.content if quality.passed else response.content,
            "quality_passed": quality.passed,
            "model": response.model,
            "usage": {
                "prompt_tokens": response.prompt_tokens,
                "completion_tokens": response.completion_tokens,
                "total_tokens": response.total_tokens,
                "latency_ms": response.latency_ms,
            },
        }
