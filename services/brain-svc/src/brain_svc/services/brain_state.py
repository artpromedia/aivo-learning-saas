"""Brain state service — CRUD + Redis hot cache."""

from __future__ import annotations

import copy
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.config import get_settings
from brain_svc.models.brain_state import BrainState
from brain_svc.redis_client import get_redis

logger = logging.getLogger(__name__)

CACHE_KEY_PREFIX = "brain:state:"


def _cache_key(learner_id: str) -> str:
    return f"{CACHE_KEY_PREFIX}{learner_id}"


async def get_brain_state(session: AsyncSession, learner_id: str) -> BrainState | None:
    """Get brain state by learner_id, checking Redis cache first."""
    # Try Redis cache
    redis = await get_redis()
    cached = await redis.get(_cache_key(learner_id))
    if cached:
        logger.debug("Cache hit for learner %s", learner_id)
        return _deserialize_brain_state(json.loads(cached))

    # Fallback to DB
    learner_uuid = uuid.UUID(learner_id)
    result = await session.execute(
        select(BrainState).where(BrainState.learner_id == learner_uuid)
    )
    brain_state = result.scalar_one_or_none()
    if brain_state:
        await _cache_brain_state(brain_state)
    return brain_state


async def get_brain_state_by_id(session: AsyncSession, brain_state_id: str) -> BrainState | None:
    """Get brain state by primary key."""
    result = await session.execute(
        select(BrainState).where(BrainState.id == uuid.UUID(brain_state_id))
    )
    return result.scalar_one_or_none()


async def update_brain_state(
    session: AsyncSession,
    brain_state: BrainState,
    updates: dict[str, Any],
) -> BrainState:
    """Apply updates to a brain state and invalidate cache."""
    for key, value in updates.items():
        if hasattr(brain_state, key):
            setattr(brain_state, key, value)
    brain_state.updated_at = datetime.now(timezone.utc)
    await session.flush()
    await _invalidate_cache(str(brain_state.learner_id))
    return brain_state


async def delete_brain_state(session: AsyncSession, brain_state: BrainState) -> None:
    """Delete a brain state and invalidate cache."""
    learner_id = str(brain_state.learner_id)
    await session.delete(brain_state)
    await session.flush()
    await _invalidate_cache(learner_id)


async def _cache_brain_state(brain_state: BrainState) -> None:
    """Cache brain state in Redis with TTL."""
    redis = await get_redis()
    settings = get_settings()
    data = _serialize_brain_state(brain_state)
    await redis.set(
        _cache_key(str(brain_state.learner_id)),
        json.dumps(data),
        ex=settings.brain_cache_ttl_seconds,
    )


async def _invalidate_cache(learner_id: str) -> None:
    """Remove brain state from Redis cache."""
    redis = await get_redis()
    await redis.delete(_cache_key(learner_id))
    logger.debug("Cache invalidated for learner %s", learner_id)


def _serialize_brain_state(bs: BrainState) -> dict[str, Any]:
    return {
        "id": str(bs.id),
        "learner_id": str(bs.learner_id),
        "main_brain_version": bs.main_brain_version,
        "seed_version": bs.seed_version,
        "state": bs.state,
        "functioning_level_profile": bs.functioning_level_profile,
        "iep_profile": bs.iep_profile,
        "active_tutors": bs.active_tutors,
        "delivery_levels": bs.delivery_levels,
        "preferred_modality": bs.preferred_modality,
        "attention_span_minutes": bs.attention_span_minutes,
        "cognitive_load": bs.cognitive_load,
        "created_at": bs.created_at.isoformat() if bs.created_at else None,
        "updated_at": bs.updated_at.isoformat() if bs.updated_at else None,
    }


def _deserialize_brain_state(data: dict[str, Any]) -> BrainState:
    bs = BrainState(
        id=uuid.UUID(data["id"]),
        learner_id=uuid.UUID(data["learner_id"]),
        main_brain_version=data.get("main_brain_version"),
        seed_version=data.get("seed_version"),
        state=data.get("state", {}),
        functioning_level_profile=data.get("functioning_level_profile"),
        iep_profile=data.get("iep_profile"),
        active_tutors=data.get("active_tutors"),
        delivery_levels=data.get("delivery_levels"),
        preferred_modality=data.get("preferred_modality"),
        attention_span_minutes=data.get("attention_span_minutes"),
        cognitive_load=data.get("cognitive_load"),
    )
    return bs
