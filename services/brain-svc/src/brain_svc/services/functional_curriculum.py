"""Functional curriculum service — milestone tracking."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.models.functional import FunctionalMilestone, LearnerMilestone

logger = logging.getLogger(__name__)


async def get_milestones(
    session: AsyncSession,
    domain: str | None = None,
) -> list[FunctionalMilestone]:
    """List functional milestones, optionally filtered by domain."""
    query = select(FunctionalMilestone).order_by(
        FunctionalMilestone.domain, FunctionalMilestone.order_index
    )
    if domain:
        query = query.where(FunctionalMilestone.domain == domain)
    result = await session.execute(query)
    return list(result.scalars().all())


async def get_learner_milestones(
    session: AsyncSession,
    learner_id: str,
    domain: str | None = None,
) -> list[LearnerMilestone]:
    """List milestone progress for a learner."""
    filters = [LearnerMilestone.learner_id == uuid.UUID(learner_id)]
    if domain:
        filters.append(
            LearnerMilestone.milestone_id.in_(
                select(FunctionalMilestone.id).where(FunctionalMilestone.domain == domain)
            )
        )
    result = await session.execute(
        select(LearnerMilestone)
        .where(and_(*filters))
        .order_by(LearnerMilestone.created_at)
    )
    return list(result.scalars().all())


async def update_milestone_status(
    session: AsyncSession,
    learner_id: str,
    milestone_id: str,
    status: str,
    observation: str | None = None,
) -> LearnerMilestone:
    """Update or create a learner's milestone progress."""
    result = await session.execute(
        select(LearnerMilestone).where(
            and_(
                LearnerMilestone.learner_id == uuid.UUID(learner_id),
                LearnerMilestone.milestone_id == uuid.UUID(milestone_id),
            )
        )
    )
    lm = result.scalar_one_or_none()

    if lm is None:
        lm = LearnerMilestone(
            learner_id=uuid.UUID(learner_id),
            milestone_id=uuid.UUID(milestone_id),
            status=status,
            observations=[],
        )
        session.add(lm)

    lm.status = status
    lm.updated_at = datetime.now(timezone.utc)

    if status in ("EMERGING", "ACHIEVED"):
        lm.last_observed_at = datetime.now(timezone.utc)

    if observation:
        observations = list(lm.observations or [])
        observations.append({
            "text": observation,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        lm.observations = observations

    await session.flush()
    logger.info(
        "Milestone %s updated to %s for learner %s",
        milestone_id, status, learner_id,
    )
    return lm


async def create_milestone(
    session: AsyncSession,
    domain: str,
    name: str,
    description: str,
    order_index: int,
) -> FunctionalMilestone:
    """Create a new functional milestone definition."""
    milestone = FunctionalMilestone(
        domain=domain,
        name=name,
        description=description,
        order_index=order_index,
    )
    session.add(milestone)
    await session.flush()
    return milestone
