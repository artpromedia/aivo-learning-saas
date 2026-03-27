"""Subject tutor agent — generates streaming tutor responses."""

from __future__ import annotations

import logging
from typing import Any

from ai_svc.llm.gateway import LLMGateway
from ai_svc.prompts.assembler import PromptAssembler
from ai_svc.quality_gate.pipeline import QualityGatePipeline

logger = logging.getLogger(__name__)


class TutorResponder:
    """Generates tutor responses with persona-aware prompting."""

    def __init__(self, gateway: LLMGateway) -> None:
        self._gateway = gateway
        self._assembler = PromptAssembler()
        self._quality_gate = QualityGatePipeline()

    async def respond(
        self,
        learner_context: dict[str, Any],
        subject: str,
        user_input: str,
        conversation_history: list[dict[str, str]] | None = None,
        tutor_persona: str | None = None,
        tenant_override: str | None = None,
    ) -> dict[str, Any]:
        """Generate a tutor response."""
        persona = tutor_persona or subject.lower()

        messages = self._assembler.assemble(
            session_type="tutor_chat",
            learner_context=learner_context,
            request_data={
                "subject": subject,
                "user_input": user_input,
                "conversation_history": conversation_history,
            },
            tutor_persona=persona,
        )

        # Inject conversation history before the user message
        if conversation_history:
            insert_idx = len(messages) - 1  # Before the last user message
            for hist_msg in conversation_history:
                messages.insert(insert_idx, hist_msg)
                insert_idx += 1

        response = await self._gateway.generate(
            messages=messages,
            task_type="tutor_response",
            tenant_override=tenant_override,
            temperature=0.8,
        )

        quality = self._quality_gate.validate(response.content, learner_context)

        return {
            "response": quality.content if quality.passed else response.content,
            "persona": persona,
            "quality_passed": quality.passed,
            "model": response.model,
            "usage": {
                "prompt_tokens": response.prompt_tokens,
                "completion_tokens": response.completion_tokens,
                "total_tokens": response.total_tokens,
                "latency_ms": response.latency_ms,
            },
        }
