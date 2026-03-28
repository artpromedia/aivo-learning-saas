"""Learner Brain context injection — Layer 2 of prompt assembly."""

from __future__ import annotations

from typing import Any


def build_learner_context_block(context: dict[str, Any]) -> str:
    """Build a structured context block from the learner's Brain state.

    This is injected as Layer 2 between the system prompt and user request.
    """
    if not context:
        return ""

    parts: list[str] = ["## Current Learner Profile"]

    # Basic profile
    if context.get("enrolled_grade"):
        parts.append(f"- Grade: {context['enrolled_grade']}")
    if context.get("functioning_level"):
        parts.append(f"- Functioning Level: {context['functioning_level']}")
    if context.get("communication_mode"):
        parts.append(f"- Communication Mode: {context['communication_mode']}")
    if context.get("preferred_modality"):
        parts.append(f"- Preferred Modality: {context['preferred_modality']}")
    if context.get("attention_span"):
        parts.append(f"- Attention Span: {context['attention_span']} minutes")
    if context.get("cognitive_load"):
        parts.append(f"- Cognitive Load Target: {context['cognitive_load']}")
    if context.get("locale") and context["locale"] != "en":
        parts.append(f"- Response Language: {context['locale']}")

    # Delivery levels
    if context.get("delivery_levels"):
        dl = context["delivery_levels"]
        parts.append("\n### Delivery Levels")
        for key, val in dl.items():
            parts.append(f"- {key}: {val}")

    # Active accommodations
    if context.get("active_accommodations"):
        accoms = context["active_accommodations"]
        parts.append(f"\n### Active Accommodations")
        for a in accoms:
            parts.append(f"- {a}")

    # Mastery state
    if context.get("mastery_levels"):
        parts.append("\n### Current Mastery")
        for skill, level in context["mastery_levels"].items():
            parts.append(f"- {skill}: {level:.0%}" if isinstance(level, float) else f"- {skill}: {level}")

    # IEP goals
    if context.get("iep_goals"):
        parts.append("\n### Active IEP Goals")
        for goal in context["iep_goals"]:
            if isinstance(goal, dict):
                parts.append(f"- {goal.get('domain', '')}: {goal.get('goal_text', '')}")
            else:
                parts.append(f"- {goal}")

    # Active tutors
    if context.get("active_tutors"):
        tutors = context["active_tutors"]
        parts.append(f"\n### Active Tutors: {', '.join(str(t) for t in tutors)}")

    return "\n".join(parts)
