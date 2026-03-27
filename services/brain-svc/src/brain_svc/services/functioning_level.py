"""Functioning level profile management."""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.models.brain_state import BrainState
from brain_svc.models.episode import BrainEpisode
from brain_svc.services.brain_state import update_brain_state

logger = logging.getLogger(__name__)

FUNCTIONING_LEVELS = ["STANDARD", "SUPPORTED", "LOW_VERBAL", "NON_VERBAL", "PRE_SYMBOLIC"]

CONTENT_RULES: dict[str, dict[str, Any]] = {
    "STANDARD": {
        "max_choices": 4,
        "text_complexity": "GRADE_LEVEL",
        "visual_support": False,
        "audio_required": False,
        "partner_support": False,
    },
    "SUPPORTED": {
        "max_choices": 4,
        "text_complexity": "SIMPLIFIED",
        "visual_support": True,
        "audio_required": False,
        "partner_support": False,
    },
    "LOW_VERBAL": {
        "max_choices": 3,
        "text_complexity": "MINIMAL",
        "visual_support": True,
        "audio_required": True,
        "partner_support": False,
    },
    "NON_VERBAL": {
        "max_choices": 2,
        "text_complexity": "SYMBOL_BASED",
        "visual_support": True,
        "audio_required": True,
        "partner_support": True,
    },
    "PRE_SYMBOLIC": {
        "max_choices": 2,
        "text_complexity": "SENSORY_ONLY",
        "visual_support": True,
        "audio_required": True,
        "partner_support": True,
    },
}


def get_content_rules(functioning_level: str) -> dict[str, Any]:
    """Get content delivery rules for a functioning level."""
    return CONTENT_RULES.get(functioning_level, CONTENT_RULES["STANDARD"])


def validate_functioning_level(level: str) -> bool:
    """Check if a functioning level string is valid."""
    return level in FUNCTIONING_LEVELS


async def update_functioning_level(
    session: AsyncSession,
    brain_state: BrainState,
    new_level: str,
    reason: str = "manual",
) -> dict[str, Any]:
    """Update the functioning level profile for a brain state."""
    if not validate_functioning_level(new_level):
        raise ValueError(f"Invalid functioning level: {new_level}")

    old_profile = brain_state.functioning_level_profile or {}
    old_level = old_profile.get("level", "STANDARD")

    if old_level == new_level:
        return {"changed": False, "level": old_level}

    from brain_svc.services.brain_clone import _build_functioning_level_profile
    new_profile = _build_functioning_level_profile(new_level)

    await update_brain_state(session, brain_state, {
        "functioning_level_profile": new_profile,
    })

    episode = BrainEpisode(
        brain_state_id=brain_state.id,
        event_type="FUNCTIONING_LEVEL_CHANGED",
        payload={
            "previous_level": old_level,
            "new_level": new_level,
            "reason": reason,
        },
    )
    session.add(episode)

    logger.info(
        "Functioning level changed for brain %s: %s -> %s (reason: %s)",
        brain_state.id, old_level, new_level, reason,
    )

    return {
        "changed": True,
        "previous_level": old_level,
        "new_level": new_level,
        "content_rules": get_content_rules(new_level),
    }
