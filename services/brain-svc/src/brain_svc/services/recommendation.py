"""Recommendation service — generates and manages recommendations.

Supports 13 recommendation types, parent response handling,
and regression-triggered re-recommendations.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.models.recommendation import Recommendation

logger = logging.getLogger(__name__)

RECOMMENDATION_TYPES = [
    "FUNCTIONING_LEVEL_CHANGE",
    "ACCOMMODATION_ADD",
    "ACCOMMODATION_REMOVE",
    "TUTOR_UPGRADE",
    "TUTOR_ADDON",
    "DELIVERY_LEVEL_CHANGE",
    "SESSION_DURATION_ADJUST",
    "MODALITY_CHANGE",
    "IEP_GOAL_UPDATE",
    "CURRICULUM_ADJUST",
    "REGRESSION_ALERT",
    "MASTERY_CELEBRATION",
    "ASSESSMENT_RETEST",
]


async def create_recommendation(
    session: AsyncSession,
    brain_state_id: str,
    learner_id: str,
    rec_type: str,
    title: str,
    description: str,
    payload: dict[str, Any],
    re_trigger_gap_days: int = 14,
    previous_recommendation_id: str | None = None,
) -> Recommendation:
    """Create a new recommendation."""
    rec = Recommendation(
        brain_state_id=uuid.UUID(brain_state_id),
        learner_id=uuid.UUID(learner_id),
        type=rec_type,
        title=title,
        description=description,
        payload=payload,
        status="PENDING",
        re_trigger_gap_days=re_trigger_gap_days,
        previous_recommendation_id=(
            uuid.UUID(previous_recommendation_id) if previous_recommendation_id else None
        ),
    )
    session.add(rec)
    await session.flush()
    logger.info(
        "Created recommendation %s type=%s for learner %s",
        rec.id, rec_type, learner_id,
    )
    return rec


async def get_recommendations(
    session: AsyncSession,
    learner_id: str,
    status: str | None = None,
    rec_type: str | None = None,
) -> list[Recommendation]:
    """List recommendations for a learner, optionally filtered."""
    filters = [Recommendation.learner_id == uuid.UUID(learner_id)]
    if status:
        filters.append(Recommendation.status == status)
    if rec_type:
        filters.append(Recommendation.type == rec_type)
    result = await session.execute(
        select(Recommendation)
        .where(and_(*filters))
        .order_by(Recommendation.created_at.desc())
    )
    return list(result.scalars().all())


async def get_recommendation_by_id(
    session: AsyncSession,
    recommendation_id: str,
) -> Recommendation | None:
    """Get a single recommendation by ID."""
    result = await session.execute(
        select(Recommendation).where(Recommendation.id == uuid.UUID(recommendation_id))
    )
    return result.scalar_one_or_none()


async def respond_to_recommendation(
    session: AsyncSession,
    recommendation: Recommendation,
    status: str,
    responded_by: str,
    response_text: str | None = None,
) -> Recommendation:
    """Record a parent/caregiver response to a recommendation.

    status: APPROVED | DECLINED | ADJUSTED
    """
    if status not in ("APPROVED", "DECLINED", "ADJUSTED"):
        raise ValueError(f"Invalid response status: {status}")

    recommendation.status = status
    recommendation.responded_by = uuid.UUID(responded_by)
    recommendation.responded_at = datetime.now(timezone.utc)
    recommendation.parent_response_text = response_text
    recommendation.updated_at = datetime.now(timezone.utc)
    await session.flush()
    logger.info(
        "Recommendation %s responded: %s by %s",
        recommendation.id, status, responded_by,
    )
    return recommendation


async def can_re_trigger(
    session: AsyncSession,
    learner_id: str,
    rec_type: str,
) -> bool:
    """Check if enough time has passed since last recommendation of same type."""
    result = await session.execute(
        select(Recommendation)
        .where(
            and_(
                Recommendation.learner_id == uuid.UUID(learner_id),
                Recommendation.type == rec_type,
            )
        )
        .order_by(Recommendation.created_at.desc())
        .limit(1)
    )
    last_rec = result.scalar_one_or_none()
    if last_rec is None:
        return True

    gap_days = last_rec.re_trigger_gap_days or 14
    cutoff = datetime.now(timezone.utc) - timedelta(days=gap_days)
    return last_rec.created_at < cutoff


async def generate_regression_recommendation(
    session: AsyncSession,
    brain_state_id: str,
    learner_id: str,
    regressions: list[dict[str, Any]],
) -> Recommendation | None:
    """Generate a regression alert recommendation if eligible."""
    if not regressions:
        return None

    if not await can_re_trigger(session, learner_id, "REGRESSION_ALERT"):
        logger.debug("Skipping regression recommendation — within re-trigger gap")
        return None

    skills_summary = ", ".join(r["skill"] for r in regressions)
    return await create_recommendation(
        session=session,
        brain_state_id=brain_state_id,
        learner_id=learner_id,
        rec_type="REGRESSION_ALERT",
        title=f"Mastery regression detected in: {skills_summary}",
        description=(
            f"A significant drop in mastery (≥15%) has been detected in "
            f"{len(regressions)} skill(s). Consider reviewing recent sessions "
            f"and adjusting the learning plan."
        ),
        payload={"regressions": regressions},
    )


async def generate_mastery_celebration(
    session: AsyncSession,
    brain_state_id: str,
    learner_id: str,
    skill: str,
    mastery_level: float,
) -> Recommendation | None:
    """Generate a celebration when mastery reaches ≥0.9."""
    if mastery_level < 0.9:
        return None

    if not await can_re_trigger(session, learner_id, "MASTERY_CELEBRATION"):
        return None

    return await create_recommendation(
        session=session,
        brain_state_id=brain_state_id,
        learner_id=learner_id,
        rec_type="MASTERY_CELEBRATION",
        title=f"Mastery achieved: {skill}",
        description=(
            f"Great progress! Mastery level for {skill} has reached "
            f"{mastery_level:.0%}. Consider advancing to the next skill level."
        ),
        payload={"skill": skill, "mastery_level": mastery_level},
    )
