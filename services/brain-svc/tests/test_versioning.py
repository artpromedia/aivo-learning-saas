"""Tests for versioning service."""

from __future__ import annotations

import uuid
from unittest.mock import patch, AsyncMock

import pytest

from brain_svc.services.versioning import (
    create_snapshot,
    get_snapshot,
    list_snapshots,
    rollback_to_snapshot,
)


class TestCreateSnapshot:
    @pytest.mark.asyncio
    async def test_first_snapshot(self, session, brain_state):
        snap = await create_snapshot(
            session=session,
            brain_state=brain_state,
            trigger="MANUAL",
        )
        assert snap.version_number == 1
        assert snap.trigger == "MANUAL"
        assert snap.snapshot["state"] == brain_state.state

    @pytest.mark.asyncio
    async def test_auto_increment_version(self, session, brain_state):
        await create_snapshot(session, brain_state, "CLONE")
        snap2 = await create_snapshot(session, brain_state, "UPDATE")
        assert snap2.version_number == 2


class TestListSnapshots:
    @pytest.mark.asyncio
    async def test_list_empty(self, session, brain_state):
        snaps = await list_snapshots(session, str(brain_state.id))
        assert snaps == []

    @pytest.mark.asyncio
    async def test_list_ordered(self, session, brain_state):
        await create_snapshot(session, brain_state, "A")
        await create_snapshot(session, brain_state, "B")
        snaps = await list_snapshots(session, str(brain_state.id))
        assert len(snaps) == 2


class TestGetSnapshot:
    @pytest.mark.asyncio
    async def test_get_existing(self, session, brain_state):
        snap = await create_snapshot(session, brain_state, "TEST")
        found = await get_snapshot(session, str(snap.id))
        assert found is not None
        assert found.trigger == "TEST"

    @pytest.mark.asyncio
    async def test_get_missing(self, session):
        found = await get_snapshot(session, str(uuid.uuid4()))
        assert found is None


class TestRollback:
    @pytest.mark.asyncio
    async def test_rollback_restores_state(self, session, brain_state, mock_redis):
        with patch("brain_svc.services.brain_state.get_redis", return_value=mock_redis):
            original = await create_snapshot(session, brain_state, "INITIAL_CLONE")
            # Modify state
            brain_state.state = {"mastery_levels": {"MATH": 0.9}}
            await session.flush()
            # Rollback
            restored = await rollback_to_snapshot(session, brain_state, original)
            assert restored.state["mastery_levels"]["MATH"] == 0.5
