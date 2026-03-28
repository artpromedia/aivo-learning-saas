"""Tests for the regression detector service."""

from __future__ import annotations

import copy
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.models.brain_state import BrainState
from brain_svc.models.snapshot import BrainStateSnapshot
from brain_svc.services.regression_detector import detect_regressions


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@pytest_asyncio.fixture
async def upgraded_brain_with_regression(session: AsyncSession) -> tuple[BrainState, BrainStateSnapshot]:
    """Create a brain that was upgraded 5 days ago and has regressed >= 15% in MATH."""
    created = _utcnow() - timedelta(days=30)
    upgraded_at = _utcnow() - timedelta(days=5)

    bs = BrainState(
        learner_id=uuid.uuid4(),
        main_brain_version="aivo-brain-v3.1",
        seed_version="aivo-brain-v3.1",
        state={
            "mastery_levels": {"MATH": 0.30, "ELA": 0.50},
            "domain_scores": {},
        },
        functioning_level_profile={"level": "STANDARD"},
        iep_profile={},
        active_tutors=[],
        delivery_levels={},
        attention_span_minutes=30,
        cognitive_load="MEDIUM",
        created_at=created,
        updated_at=_utcnow(),  # Has activity since upgrade
    )
    session.add(bs)
    await session.flush()

    snapshot = BrainStateSnapshot(
        brain_state_id=bs.id,
        snapshot={
            "state": {
                "mastery_levels": {"MATH": 0.50, "ELA": 0.50},
            },
            "functioning_level_profile": {"level": "STANDARD"},
        },
        trigger="MAIN_BRAIN_UPGRADE",
        trigger_metadata={"previous_version": "aivo-brain-v3.0", "new_version": "aivo-brain-v3.1"},
        version_number=1,
        created_at=upgraded_at,
    )
    session.add(snapshot)
    await session.flush()

    return bs, snapshot


@pytest_asyncio.fixture
async def upgraded_brain_no_regression(session: AsyncSession) -> tuple[BrainState, BrainStateSnapshot]:
    """Create a brain that was upgraded but has NOT regressed (< 15% drop)."""
    created = _utcnow() - timedelta(days=30)
    upgraded_at = _utcnow() - timedelta(days=5)

    bs = BrainState(
        learner_id=uuid.uuid4(),
        main_brain_version="aivo-brain-v3.1",
        seed_version="aivo-brain-v3.1",
        state={
            "mastery_levels": {"MATH": 0.45, "ELA": 0.48},
            "domain_scores": {},
        },
        functioning_level_profile={"level": "STANDARD"},
        iep_profile={},
        active_tutors=[],
        delivery_levels={},
        attention_span_minutes=30,
        cognitive_load="MEDIUM",
        created_at=created,
        updated_at=_utcnow(),
    )
    session.add(bs)
    await session.flush()

    snapshot = BrainStateSnapshot(
        brain_state_id=bs.id,
        snapshot={
            "state": {
                "mastery_levels": {"MATH": 0.50, "ELA": 0.50},
            },
            "functioning_level_profile": {"level": "STANDARD"},
        },
        trigger="MAIN_BRAIN_UPGRADE",
        trigger_metadata={"previous_version": "aivo-brain-v3.0", "new_version": "aivo-brain-v3.1"},
        version_number=1,
        created_at=upgraded_at,
    )
    session.add(snapshot)
    await session.flush()

    return bs, snapshot


@pytest_asyncio.fixture
async def new_learner_brain(session: AsyncSession) -> tuple[BrainState, BrainStateSnapshot]:
    """Create a brand-new learner (created < 14 days ago) with an upgrade snapshot."""
    created = _utcnow() - timedelta(days=3)
    upgraded_at = _utcnow() - timedelta(days=2)

    bs = BrainState(
        learner_id=uuid.uuid4(),
        main_brain_version="aivo-brain-v3.1",
        seed_version="aivo-brain-v3.1",
        state={
            "mastery_levels": {"MATH": 0.10, "ELA": 0.50},
            "domain_scores": {},
        },
        functioning_level_profile={"level": "STANDARD"},
        iep_profile={},
        active_tutors=[],
        delivery_levels={},
        attention_span_minutes=30,
        cognitive_load="MEDIUM",
        created_at=created,
        updated_at=_utcnow(),
    )
    session.add(bs)
    await session.flush()

    snapshot = BrainStateSnapshot(
        brain_state_id=bs.id,
        snapshot={
            "state": {
                "mastery_levels": {"MATH": 0.50, "ELA": 0.50},
            },
            "functioning_level_profile": {"level": "STANDARD"},
        },
        trigger="MAIN_BRAIN_UPGRADE",
        trigger_metadata={},
        version_number=1,
        created_at=upgraded_at,
    )
    session.add(snapshot)
    await session.flush()

    return bs, snapshot


@pytest_asyncio.fixture
async def inactive_brain(session: AsyncSession) -> tuple[BrainState, BrainStateSnapshot]:
    """Create a brain that was upgraded but has had no activity since."""
    created = _utcnow() - timedelta(days=30)
    upgraded_at = _utcnow() - timedelta(days=5)

    bs = BrainState(
        learner_id=uuid.uuid4(),
        main_brain_version="aivo-brain-v3.1",
        seed_version="aivo-brain-v3.1",
        state={
            "mastery_levels": {"MATH": 0.30, "ELA": 0.50},
            "domain_scores": {},
        },
        functioning_level_profile={"level": "STANDARD"},
        iep_profile={},
        active_tutors=[],
        delivery_levels={},
        attention_span_minutes=30,
        cognitive_load="MEDIUM",
        created_at=created,
        updated_at=upgraded_at,  # No activity since upgrade
    )
    session.add(bs)
    await session.flush()

    snapshot = BrainStateSnapshot(
        brain_state_id=bs.id,
        snapshot={
            "state": {
                "mastery_levels": {"MATH": 0.50, "ELA": 0.50},
            },
            "functioning_level_profile": {"level": "STANDARD"},
        },
        trigger="MAIN_BRAIN_UPGRADE",
        trigger_metadata={},
        version_number=1,
        created_at=upgraded_at,
    )
    session.add(snapshot)
    await session.flush()

    return bs, snapshot


@pytest.mark.asyncio
@patch("brain_svc.services.regression_detector.publish_recommendation_created", new_callable=AsyncMock)
async def test_detects_15_percent_drop(mock_pub, session, upgraded_brain_with_regression):
    """Regression detector should flag brains with >= 15% mastery drop."""
    results = await detect_regressions(session)

    assert len(results) == 1
    result = results[0]
    assert result["learner_id"] == str(upgraded_brain_with_regression[0].learner_id)
    assert len(result["regressions"]) >= 1

    # MATH dropped from 0.50 to 0.30 = 0.20 drop (>= 0.15)
    math_reg = [r for r in result["regressions"] if r["skill"] == "MATH"]
    assert len(math_reg) == 1
    assert math_reg[0]["drop"] >= 0.15

    # Verify recommendation was published
    mock_pub.assert_called_once()


@pytest.mark.asyncio
@patch("brain_svc.services.regression_detector.publish_recommendation_created", new_callable=AsyncMock)
async def test_ignores_below_15_percent_drop(mock_pub, session, upgraded_brain_no_regression):
    """Regression detector should not flag brains with < 15% mastery drop."""
    results = await detect_regressions(session)
    assert len(results) == 0
    mock_pub.assert_not_called()


@pytest.mark.asyncio
@patch("brain_svc.services.regression_detector.publish_recommendation_created", new_callable=AsyncMock)
async def test_skips_new_learners(mock_pub, session, new_learner_brain):
    """Regression detector should skip learners created < 14 days ago."""
    results = await detect_regressions(session)
    assert len(results) == 0
    mock_pub.assert_not_called()


@pytest.mark.asyncio
@patch("brain_svc.services.regression_detector.publish_recommendation_created", new_callable=AsyncMock)
async def test_skips_inactive_learners(mock_pub, session, inactive_brain):
    """Regression detector should skip learners with no activity since upgrade."""
    results = await detect_regressions(session)
    assert len(results) == 0
    mock_pub.assert_not_called()
