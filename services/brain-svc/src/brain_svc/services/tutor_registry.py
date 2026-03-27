"""Tutor registry — manages active tutors for a brain state."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.models.brain_state import BrainState
from brain_svc.models.episode import BrainEpisode
from brain_svc.services.brain_state import update_brain_state

logger = logging.getLogger(__name__)


async def get_active_tutors(brain_state: BrainState) -> list[dict[str, Any]]:
    """Get list of active tutors for a brain state."""
    return brain_state.active_tutors or []


async def activate_tutor(
    session: AsyncSession,
    brain_state: BrainState,
    tutor_id: str,
    tutor_type: str,
    subject: str | None = None,
) -> list[dict[str, Any]]:
    """Add a tutor to the active tutors list."""
    tutors = list(brain_state.active_tutors or [])

    # Check if already active
    if any(t.get("tutor_id") == tutor_id for t in tutors):
        logger.debug("Tutor %s already active for brain %s", tutor_id, brain_state.id)
        return tutors

    tutors.append({
        "tutor_id": tutor_id,
        "tutor_type": tutor_type,
        "subject": subject,
        "activated_at": datetime.now(timezone.utc).isoformat(),
    })

    await update_brain_state(session, brain_state, {"active_tutors": tutors})

    episode = BrainEpisode(
        brain_state_id=brain_state.id,
        event_type="TUTOR_ACTIVATED",
        payload={"tutor_id": tutor_id, "tutor_type": tutor_type, "subject": subject},
    )
    session.add(episode)

    logger.info("Tutor %s activated for brain %s", tutor_id, brain_state.id)
    return tutors


async def deactivate_tutor(
    session: AsyncSession,
    brain_state: BrainState,
    tutor_id: str,
) -> list[dict[str, Any]]:
    """Remove a tutor from active tutors."""
    tutors = [t for t in (brain_state.active_tutors or []) if t.get("tutor_id") != tutor_id]
    await update_brain_state(session, brain_state, {"active_tutors": tutors})

    episode = BrainEpisode(
        brain_state_id=brain_state.id,
        event_type="TUTOR_DEACTIVATED",
        payload={"tutor_id": tutor_id},
    )
    session.add(episode)

    logger.info("Tutor %s deactivated for brain %s", tutor_id, brain_state.id)
    return tutors
