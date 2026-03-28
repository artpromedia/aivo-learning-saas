"""Tests for the brain upgrade pipeline."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest
import pytest_asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.models.brain_state import BrainState
from brain_svc.models.snapshot import BrainStateSnapshot
from brain_svc.services.upgrade import upgrade_all_brains


@pytest_asyncio.fixture
async def multiple_brain_states(session: AsyncSession) -> list[BrainState]:
    """Create several brain states at an old version for upgrade testing."""
    states = []
    for i in range(3):
        bs = BrainState(
            learner_id=uuid.uuid4(),
            main_brain_version="aivo-brain-v3.0",
            seed_version="aivo-brain-v3.0",
            state={
                "mastery_levels": {"MATH": 0.4 + i * 0.1, "ELA": 0.3},
                "domain_scores": {"MATH": 0.4, "ELA": 0.3},
                "episodic_memory": [{"event": f"test_{i}"}],
                "active_accommodations": ["extended_time"],
            },
            functioning_level_profile={"level": "STANDARD"},
            iep_profile={"goals": [f"goal_{i}"]},
            active_tutors=[],
            delivery_levels={"reading_level": "DEVELOPING"},
            attention_span_minutes=30,
            cognitive_load="MEDIUM",
        )
        session.add(bs)
        states.append(bs)
    await session.flush()
    return states


@pytest.mark.asyncio
@patch("brain_svc.services.upgrade.publish_brain_upgraded", new_callable=AsyncMock)
@patch("brain_svc.services.upgrade.publish_upgrade_batch_completed", new_callable=AsyncMock)
@patch("brain_svc.redis_client.get_redis")
async def test_upgrade_preserves_mastery(
    mock_redis, mock_batch_pub, mock_upgrade_pub,
    session, multiple_brain_states, mock_redis_instance=None,
):
    """Verify that upgrade preserves learner-specific mastery levels."""
    redis_mock = AsyncMock()
    redis_mock.get = AsyncMock(return_value=None)
    redis_mock.set = AsyncMock()
    redis_mock.delete = AsyncMock()
    mock_redis.return_value = redis_mock

    original_mastery = {}
    for bs in multiple_brain_states:
        original_mastery[str(bs.id)] = bs.state["mastery_levels"].copy()

    stats = await upgrade_all_brains(session, "aivo-brain-v3.1", dry_run=False)

    assert stats["total_upgraded"] == 3
    assert stats["total_failed"] == 0

    for bs in multiple_brain_states:
        await session.refresh(bs)
        current_mastery = bs.state.get("mastery_levels", {})
        orig = original_mastery[str(bs.id)]
        # Original domains should still be present with same values
        for domain, value in orig.items():
            assert domain in current_mastery
            assert current_mastery[domain] == value


@pytest.mark.asyncio
@patch("brain_svc.services.upgrade.publish_brain_upgraded", new_callable=AsyncMock)
@patch("brain_svc.services.upgrade.publish_upgrade_batch_completed", new_callable=AsyncMock)
@patch("brain_svc.redis_client.get_redis")
async def test_upgrade_creates_snapshot(
    mock_redis, mock_batch_pub, mock_upgrade_pub,
    session, multiple_brain_states,
):
    """Verify that upgrade creates a MAIN_BRAIN_UPGRADE snapshot for each brain."""
    redis_mock = AsyncMock()
    redis_mock.get = AsyncMock(return_value=None)
    redis_mock.set = AsyncMock()
    redis_mock.delete = AsyncMock()
    mock_redis.return_value = redis_mock

    await upgrade_all_brains(session, "aivo-brain-v3.1", dry_run=False)

    for bs in multiple_brain_states:
        result = await session.execute(
            select(BrainStateSnapshot)
            .where(BrainStateSnapshot.brain_state_id == bs.id)
            .where(BrainStateSnapshot.trigger == "MAIN_BRAIN_UPGRADE")
        )
        snapshots = list(result.scalars().all())
        assert len(snapshots) == 1
        assert snapshots[0].trigger_metadata["previous_version"] == "aivo-brain-v3.0"
        assert snapshots[0].trigger_metadata["new_version"] == "aivo-brain-v3.1"


@pytest.mark.asyncio
@patch("brain_svc.services.upgrade.publish_brain_upgraded", new_callable=AsyncMock)
@patch("brain_svc.services.upgrade.publish_upgrade_batch_completed", new_callable=AsyncMock)
@patch("brain_svc.redis_client.get_redis")
async def test_upgrade_is_idempotent(
    mock_redis, mock_batch_pub, mock_upgrade_pub,
    session, multiple_brain_states,
):
    """Verify that running upgrade twice skips already-upgraded brains."""
    redis_mock = AsyncMock()
    redis_mock.get = AsyncMock(return_value=None)
    redis_mock.set = AsyncMock()
    redis_mock.delete = AsyncMock()
    mock_redis.return_value = redis_mock

    # First upgrade
    stats1 = await upgrade_all_brains(session, "aivo-brain-v3.1", dry_run=False)
    assert stats1["total_upgraded"] == 3

    # Second upgrade — should skip all
    stats2 = await upgrade_all_brains(session, "aivo-brain-v3.1", dry_run=False)
    assert stats2["total_upgraded"] == 0
    assert stats2["total_skipped"] == 3


@pytest.mark.asyncio
@patch("brain_svc.redis_client.get_redis")
async def test_dry_run_returns_count_without_changing(
    mock_redis, session, multiple_brain_states,
):
    """Verify that dry_run returns upgrade count without modifying brain states."""
    redis_mock = AsyncMock()
    redis_mock.get = AsyncMock(return_value=None)
    redis_mock.set = AsyncMock()
    redis_mock.delete = AsyncMock()
    mock_redis.return_value = redis_mock

    stats = await upgrade_all_brains(session, "aivo-brain-v3.1", dry_run=True)

    assert stats["total_upgraded"] == 3
    assert stats["dry_run"] is True

    # Verify no brain was actually changed
    for bs in multiple_brain_states:
        await session.refresh(bs)
        assert bs.main_brain_version == "aivo-brain-v3.0"

    # Verify no snapshots were created
    result = await session.execute(
        select(BrainStateSnapshot).where(
            BrainStateSnapshot.trigger == "MAIN_BRAIN_UPGRADE"
        )
    )
    assert len(list(result.scalars().all())) == 0
