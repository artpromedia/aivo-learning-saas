"""3-layer prompt assembly engine.

Layer 1: Main Brain system prompt (static per session type)
Layer 2: Learner Brain context (per-learner, dynamic)
Layer 3: Session request (per-request)
"""

from __future__ import annotations

import logging
from typing import Any

from ai_svc.prompts.system_prompts.main_brain import get_main_brain_prompt
from ai_svc.prompts.context_injector import build_learner_context_block
from ai_svc.prompts.functioning_level_rules import get_content_rules_prompt

logger = logging.getLogger(__name__)


class PromptAssembler:
    """Assembles 3-layer prompts for LLM generation."""

    def assemble(
        self,
        session_type: str,
        learner_context: dict[str, Any],
        request_data: dict[str, Any],
        tutor_persona: str | None = None,
        curriculum_standards: list[str] | None = None,
    ) -> list[dict[str, str]]:
        """Assemble a full messages array from three prompt layers.

        Args:
            session_type: lesson, tutor_chat, writing, quiz, homework, activity
            learner_context: Brain context for the learner
            request_data: Per-request payload (skill, user_input, etc.)
            tutor_persona: Optional tutor persona name (nova, sage, etc.)
            curriculum_standards: RAG-retrieved curriculum standards

        Returns:
            OpenAI-format messages array ready for LLM call.
        """
        messages: list[dict[str, str]] = []

        # Layer 1: System prompt
        system_prompt = self._build_system_prompt(
            session_type=session_type,
            learner_context=learner_context,
            tutor_persona=tutor_persona,
            curriculum_standards=curriculum_standards,
        )
        messages.append({"role": "system", "content": system_prompt})

        # Layer 2: Learner context as assistant preamble
        context_block = build_learner_context_block(learner_context)
        if context_block:
            messages.append({"role": "assistant", "content": context_block})

        # Layer 3: Session request
        user_message = self._build_request_message(session_type, request_data)
        messages.append({"role": "user", "content": user_message})

        return messages

    def _build_system_prompt(
        self,
        session_type: str,
        learner_context: dict[str, Any],
        tutor_persona: str | None = None,
        curriculum_standards: list[str] | None = None,
    ) -> str:
        """Build the Layer 1 system prompt."""
        parts: list[str] = []

        # Main Brain teaching philosophy
        parts.append(get_main_brain_prompt())

        # Tutor persona (if applicable)
        if tutor_persona and session_type in ("tutor_chat", "lesson"):
            from ai_svc.prompts.system_prompts.tutor_personas import get_persona_prompt
            persona_prompt = get_persona_prompt(tutor_persona)
            if persona_prompt:
                parts.append(persona_prompt)

        # Session type context
        if session_type == "homework":
            from ai_svc.prompts.system_prompts.homework_agent import HOMEWORK_AGENT_PROMPT
            parts.append(HOMEWORK_AGENT_PROMPT)
        elif session_type == "writing":
            from ai_svc.prompts.system_prompts.writing_coach import WRITING_COACH_PROMPT
            parts.append(WRITING_COACH_PROMPT)

        # Functioning level content rules
        fl = learner_context.get("functioning_level", "STANDARD")
        fl_rules = get_content_rules_prompt(fl)
        if fl_rules:
            parts.append(fl_rules)

        # RAG curriculum standards
        if curriculum_standards:
            standards_text = "\n".join(f"- {s}" for s in curriculum_standards)
            parts.append(
                f"## Relevant Curriculum Standards\n{standards_text}"
            )

        return "\n\n".join(parts)

    def _build_request_message(
        self,
        session_type: str,
        request_data: dict[str, Any],
    ) -> str:
        """Build the Layer 3 user request message."""
        parts: list[str] = []

        if session_type == "lesson":
            subject = request_data.get("subject", "")
            skill = request_data.get("skill", "")
            grade = request_data.get("grade", "")
            parts.append(
                f"Generate an adaptive lesson for {subject} targeting the skill: {skill}. "
                f"Grade level: {grade}."
            )
            if request_data.get("mastery_gaps"):
                gaps = ", ".join(request_data["mastery_gaps"])
                parts.append(f"Focus on these mastery gaps: {gaps}.")

        elif session_type == "tutor_chat":
            user_input = request_data.get("user_input", "")
            subject = request_data.get("subject", "")
            parts.append(f"Subject: {subject}")
            parts.append(f"Student says: {user_input}")
            if request_data.get("conversation_history"):
                parts.insert(0, "Continue the tutoring conversation.")

        elif session_type == "quiz":
            subject = request_data.get("subject", "")
            skills = request_data.get("skills", [])
            num_questions = request_data.get("num_questions", 5)
            parts.append(
                f"Generate a {num_questions}-question quiz for {subject} "
                f"covering skills: {', '.join(skills)}."
            )

        elif session_type == "homework":
            text_content = request_data.get("text", "")
            subject = request_data.get("subject", "")
            parts.append(
                f"Adapt this homework for the learner's level. Subject: {subject}.\n"
                f"Original homework:\n{text_content}"
            )

        elif session_type == "writing":
            submission = request_data.get("submission", "")
            prompt_text = request_data.get("prompt", "")
            parts.append(
                f"Writing prompt: {prompt_text}\n\n"
                f"Student's submission:\n{submission}\n\n"
                f"Provide detailed, encouraging writing feedback."
            )

        elif session_type == "activity":
            domain = request_data.get("domain", "")
            parts.append(
                f"Generate a structured activity guide for the functional domain: {domain}."
            )

        else:
            parts.append(request_data.get("prompt", "Generate appropriate content."))

        return "\n".join(parts)
