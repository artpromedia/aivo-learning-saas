"""Scheduled cron for archiving episodic memory from Redis to PostgreSQL."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy import select

from brain_svc.db import get_session_factory
from brain_svc.models.brain_state import BrainState
from brain_svc.services.episodic_memory import archive_episodes

logger = logging.getLogger(__name__)

ARCHIVAL_INTERVAL_SECONDS = 86400  # 24 hours


async def run_episodic_archival() -> int:
    """Archive episodes older than 30 days from Redis to PostgreSQL for all learners."""
    session_factory = get_session_factory()
    total_archived = 0

    async with session_factory() as session:
        result = await session.execute(select(BrainState))
        brain_states = list(result.scalars().all())

        logger.info("Starting episodic archival for %d brain states", len(brain_states))

        for brain_state in brain_states:
            try:
                count = await archive_episodes(
                    session=session,
                    brain_state_id=str(brain_state.id),
                    learner_id=str(brain_state.learner_id),
                    max_archive=200,
                )
                if count > 0:
                    total_archived += count
                    logger.info(
                        "Archived %d episodes for learner %s",
                        count,
                        brain_state.learner_id,
                    )
            except Exception:
                logger.exception(
                    "Failed to archive episodes for learner %s",
                    brain_state.learner_id,
                )

        await session.commit()

    logger.info("Episodic archival completed: %d episodes archived", total_archived)
    return total_archived


async def start_archival_loop() -> None:
    """Run the episodic archival on a daily schedule."""
    logger.info("Episodic archival cron started (interval=%ds)", ARCHIVAL_INTERVAL_SECONDS)
    while True:
        try:
            await run_episodic_archival()
        except Exception:
            logger.exception("Episodic archival cron iteration failed")
        await asyncio.sleep(ARCHIVAL_INTERVAL_SECONDS)
