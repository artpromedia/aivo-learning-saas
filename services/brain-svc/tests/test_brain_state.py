"""Tests for brain state service."""

from __future__ import annotations

import json
import uuid
from unittest.mock import AsyncMock, patch

import pytest

from brain_svc.models.brain_state import BrainState
from brain_svc.services.brain_state import (
    _cache_key,
    _serialize_brain_state,
    _deserialize_brain_state,
    get_brain_state,
    get_brain_state_by_id,
    update_brain_state,
    delete_brain_state,
)


class TestCacheKey:
    def test_cache_key_format(self):
        key = _cache_key("abc-123")
        assert key == "brain:state:abc-123"


class TestSerialization:
    def test_serialize_roundtrip(self, brain_state):
        serialized = _serialize_brain_state(brain_state)
        assert serialized["id"] == str(brain_state.id)
        assert serialized["learner_id"] == str(brain_state.learner_id)
        assert isinstance(serialized["state"], dict)

    def test_deserialize(self):
        data = {
            "id": str(uuid.uuid4()),
            "learner_id": str(uuid.uuid4()),
            "main_brain_version": "v3.0",
            "seed_version": "v3.0",
            "state": {"mastery_levels": {}},
            "functioning_level_profile": {"level": "STANDARD"},
            "iep_profile": None,
            "active_tutors": [],
            "delivery_levels": {},
            "preferred_modality": None,
            "attention_span_minutes": 30,
            "cognitive_load": "MEDIUM",
        }
        bs = _deserialize_brain_state(data)
        assert str(bs.id) == data["id"]
        assert bs.attention_span_minutes == 30


class TestBrainStateCRUD:
    @pytest.mark.asyncio
    async def test_get_brain_state_db_hit(self, session, brain_state, mock_redis):
        with patch("brain_svc.services.brain_state.get_redis", return_value=mock_redis):
            result = await get_brain_state(session, str(brain_state.learner_id))
        assert result is not None
        assert result.id == brain_state.id

    @pytest.mark.asyncio
    async def test_get_brain_state_cache_hit(self, session, brain_state, mock_redis):
        serialized = _serialize_brain_state(brain_state)
        mock_redis.get = AsyncMock(return_value=json.dumps(serialized))
        with patch("brain_svc.services.brain_state.get_redis", return_value=mock_redis):
            result = await get_brain_state(session, str(brain_state.learner_id))
        assert result is not None
        assert str(result.id) == str(brain_state.id)

    @pytest.mark.asyncio
    async def test_get_brain_state_not_found(self, session, mock_redis):
        with patch("brain_svc.services.brain_state.get_redis", return_value=mock_redis):
            result = await get_brain_state(session, str(uuid.uuid4()))
        assert result is None

    @pytest.mark.asyncio
    async def test_get_brain_state_by_id(self, session, brain_state):
        result = await get_brain_state_by_id(session, str(brain_state.id))
        assert result is not None
        assert result.learner_id == brain_state.learner_id

    @pytest.mark.asyncio
    async def test_update_brain_state(self, session, brain_state, mock_redis):
        with patch("brain_svc.services.brain_state.get_redis", return_value=mock_redis):
            updated = await update_brain_state(
                session, brain_state, {"cognitive_load": "HIGH"}
            )
        assert updated.cognitive_load == "HIGH"

    @pytest.mark.asyncio
    async def test_delete_brain_state(self, session, brain_state, mock_redis):
        bs_id = str(brain_state.id)
        with patch("brain_svc.services.brain_state.get_redis", return_value=mock_redis):
            await delete_brain_state(session, brain_state)
        result = await get_brain_state_by_id(session, bs_id)
        assert result is None
