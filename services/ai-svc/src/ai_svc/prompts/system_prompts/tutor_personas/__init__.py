"""Tutor persona prompts for AIVO's 7 subject tutors."""

from __future__ import annotations

from ai_svc.prompts.system_prompts.tutor_personas.nova_math import NOVA_PROMPT
from ai_svc.prompts.system_prompts.tutor_personas.sage_ela import SAGE_PROMPT
from ai_svc.prompts.system_prompts.tutor_personas.spark_science import SPARK_PROMPT
from ai_svc.prompts.system_prompts.tutor_personas.chrono_history import CHRONO_PROMPT
from ai_svc.prompts.system_prompts.tutor_personas.pixel_coding import PIXEL_PROMPT
from ai_svc.prompts.system_prompts.tutor_personas.harmony_sel import HARMONY_PROMPT
from ai_svc.prompts.system_prompts.tutor_personas.echo_speech import ECHO_PROMPT

_PERSONA_MAP: dict[str, str] = {
    "nova": NOVA_PROMPT,
    "sage": SAGE_PROMPT,
    "spark": SPARK_PROMPT,
    "chrono": CHRONO_PROMPT,
    "pixel": PIXEL_PROMPT,
    "harmony": HARMONY_PROMPT,
    "echo": ECHO_PROMPT,
    # Subject aliases
    "math": NOVA_PROMPT,
    "ela": SAGE_PROMPT,
    "science": SPARK_PROMPT,
    "history": CHRONO_PROMPT,
    "coding": PIXEL_PROMPT,
    "sel": HARMONY_PROMPT,
    "speech": ECHO_PROMPT,
}


def get_persona_prompt(persona_name: str) -> str | None:
    """Get the system prompt for a tutor persona by name or subject."""
    return _PERSONA_MAP.get(persona_name.lower())
