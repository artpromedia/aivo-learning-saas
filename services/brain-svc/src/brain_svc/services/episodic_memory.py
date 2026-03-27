"""Episodic memory service — Redis streams + PostgreSQL archival."""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.models.episode import BrainEpisode
from brain_svc.redis_client import get_redis

logger = logging.getLogger(__name__)

STREAM_KEY_PREFIX = "brain:episodes:"
MAX_STREAM_LEN = 1000  # cap per learner


def _stream_key(learner_id: str) -> str:
    return f"{STREAM_KEY_PREFIX}{learner_id}"


async def append_episode(
    learner_id: str,
    event_type: str,
    payload: dict[str, Any],
    session_id: str | None = None,
) -> str:
    """Append an episode to the Redis stream."""
    redis = await get_redis()
    data = {
        "event_type": event_type,
        "payload": json.dumps(payload),
        "session_id": session_id or "",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    msg_id = await redis.xadd(
        _stream_key(learner_id), data, maxlen=MAX_STREAM_LEN
    )
    return msg_id


async def read_recent_episodes(
    learner_id: str,
    count: int = 50,
) -> list[dict[str, Any]]:
    """Read the most recent episodes from the Redis stream."""
    redis = await get_redis()
    key = _stream_key(learner_id)
    entries = await redis.xrevrange(key, count=count)
    results: list[dict[str, Any]] = []
    for msg_id, data in entries:
        entry = {
            "id": msg_id,
            "event_type": data.get("event_type", ""),
            "session_id": data.get("session_id", ""),
            "timestamp": data.get("timestamp", ""),
        }
        raw_payload = data.get("payload", "{}")
        try:
            entry["payload"] = json.loads(raw_payload)
        except (json.JSONDecodeError, TypeError):
            entry["payload"] = {}
        results.append(entry)
    return results


async def archive_episodes(
    session: AsyncSession,
    brain_state_id: str,
    learner_id: str,
    max_archive: int = 200,
) -> int:
    """Archive episodes from Redis stream to PostgreSQL."""
    redis = await get_redis()
    key = _stream_key(learner_id)
    entries = await redis.xrange(key, count=max_archive)

    if not entries:
        return 0

    archived_ids: list[str] = []
    bs_uuid = uuid.UUID(brain_state_id)

    for msg_id, data in entries:
        raw_payload = data.get("payload", "{}")
        try:
            payload = json.loads(raw_payload)
        except (json.JSONDecodeError, TypeError):
            payload = {}

        episode = BrainEpisode(
            brain_state_id=bs_uuid,
            event_type=data.get("event_type", "UNKNOWN"),
            payload=payload,
            session_id=data.get("session_id") or None,
        )
        session.add(episode)
        archived_ids.append(msg_id)

    await session.flush()

    # Remove archived entries from stream
    if archived_ids:
        await redis.xdel(key, *archived_ids)

    logger.info(
        "Archived %d episodes for learner %s to PostgreSQL",
        len(archived_ids), learner_id,
    )
    return len(archived_ids)


async def get_archived_episodes(
    session: AsyncSession,
    brain_state_id: str,
    limit: int = 100,
    event_type: str | None = None,
) -> list[BrainEpisode]:
    """Query archived episodes from PostgreSQL."""
    query = (
        select(BrainEpisode)
        .where(BrainEpisode.brain_state_id == uuid.UUID(brain_state_id))
        .order_by(BrainEpisode.created_at.desc())
        .limit(limit)
    )
    if event_type:
        query = query.where(BrainEpisode.event_type == event_type)
    result = await session.execute(query)
    return list(result.scalars().all())
