"""Tests for mastery service."""

from __future__ import annotations

import time
import uuid
from unittest.mock import AsyncMock, patch

import pytest

from brain_svc.models.brain_state import BrainState
from brain_svc.services.mastery import (
    _state_to_skill_masteries,
    _skill_masteries_to_state,
    detect_regression,
    process_mastery_update,
    process_batch_mastery_update,
)


class TestStateConversion:
    def test_state_to_skill_masteries_dict_format(self):
        state = {
            "mastery_levels": {
                "MATH": {"p_known": 0.6, "attempts": 5, "correct_count": 3},
            }
        }
        result = _state_to_skill_masteries(state)
        assert "MATH" in result
        assert result["MATH"].p_known == 0.6
        assert result["MATH"].attempts == 5

    def test_state_to_skill_masteries_float_format(self):
        state = {"mastery_levels": {"MATH": 0.5, "ELA": 0.3}}
        result = _state_to_skill_masteries(state)
        assert result["MATH"].p_known == 0.5

    def test_empty_state(self):
        result = _state_to_skill_masteries({})
        assert result == {}

    def test_roundtrip(self):
        state = {
            "mastery_levels": {
                "MATH": {"p_known": 0.7, "attempts": 10, "correct_count": 7},
            }
        }
        masteries = _state_to_skill_masteries(state)
        back = _skill_masteries_to_state(masteries)
        assert back["MATH"]["p_known"] == 0.7
        assert back["MATH"]["attempts"] == 10


class TestRegressionDetection:
    def test_no_regression(self):
        current = {"MATH": {"p_known": 0.8}}
        previous = {"MATH": {"p_known": 0.8}}
        result = detect_regression(current, previous)
        assert result == []

    def test_regression_detected(self):
        current = {"MATH": {"p_known": 0.5}}
        previous = {"MATH": {"p_known": 0.7}}
        result = detect_regression(current, previous)
        assert len(result) == 1
        assert result[0]["skill"] == "MATH"
        assert result[0]["drop"] >= 0.15

    def test_small_drop_not_regression(self):
        current = {"MATH": {"p_known": 0.7}}
        previous = {"MATH": {"p_known": 0.8}}
        result = detect_regression(current, previous)
        assert result == []

    def test_multiple_regressions(self):
        current = {"MATH": {"p_known": 0.3}, "ELA": {"p_known": 0.2}}
        previous = {"MATH": {"p_known": 0.6}, "ELA": {"p_known": 0.5}}
        result = detect_regression(current, previous)
        assert len(result) == 2

    def test_float_format(self):
        current = {"MATH": 0.5}
        previous = {"MATH": 0.7}
        result = detect_regression(current, previous)
        assert len(result) == 1


class TestProcessMasteryUpdate:
    @pytest.mark.asyncio
    async def test_single_update(self, session, brain_state, model_store):
        with patch("brain_svc.services.brain_state.get_redis", new_callable=AsyncMock) as mock:
            mock.return_value = AsyncMock(get=AsyncMock(return_value=None), set=AsyncMock(), delete=AsyncMock())
            result = await process_mastery_update(
                session=session,
                model_store=model_store,
                brain_state=brain_state,
                skill="MATH",
                is_correct=True,
                difficulty=0.5,
                session_id="test-session",
            )
        assert result.skill == "MATH"
        assert result.delta != 0

    @pytest.mark.asyncio
    async def test_batch_update(self, session, brain_state, model_store):
        with patch("brain_svc.services.brain_state.get_redis", new_callable=AsyncMock) as mock:
            mock.return_value = AsyncMock(get=AsyncMock(return_value=None), set=AsyncMock(), delete=AsyncMock())
            results = await process_batch_mastery_update(
                session=session,
                model_store=model_store,
                brain_state=brain_state,
                interactions=[
                    {"skill": "MATH", "is_correct": True, "difficulty": 0.5, "timestamp": time.time()},
                    {"skill": "ELA", "is_correct": False, "difficulty": 0.3, "timestamp": time.time()},
                ],
                session_id="test-batch",
            )
        assert len(results) == 2
