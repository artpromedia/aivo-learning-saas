"""Tests for brain clone pipeline."""

from __future__ import annotations

import uuid

import pytest

from brain_svc.ml.model_store import ModelStore
from brain_svc.models.brain_state import BrainState
from brain_svc.services.brain_clone import (
    _build_functioning_level_profile,
    _derive_accommodations_from_signals,
    clone_brain,
)


class TestBuildFunctioningLevelProfile:
    def test_standard(self):
        profile = _build_functioning_level_profile("STANDARD")
        assert profile["level"] == "STANDARD"
        assert profile["communication_mode"] == "VERBAL"
        assert profile["session_duration_limit"] == 45

    def test_non_verbal(self):
        profile = _build_functioning_level_profile("NON_VERBAL")
        assert profile["level"] == "NON_VERBAL"
        assert profile["communication_mode"] == "NON_VERBAL_AAC"
        assert profile["session_duration_limit"] == 15

    def test_pre_symbolic(self):
        profile = _build_functioning_level_profile("PRE_SYMBOLIC")
        assert profile["level"] == "PRE_SYMBOLIC"
        assert profile["interaction_mode"] == "PARTNER_DIRECTED"

    def test_unknown_defaults_to_standard(self):
        profile = _build_functioning_level_profile("UNKNOWN")
        assert profile["level"] == "STANDARD"


class TestDeriveAccommodations:
    def test_empty_signals(self):
        result = _derive_accommodations_from_signals({}, "STANDARD")
        assert result == []

    def test_tts_signal(self):
        result = _derive_accommodations_from_signals(
            {"needs_tts": True}, "STANDARD"
        )
        assert "text_to_speech" in result

    def test_multiple_signals(self):
        signals = {
            "needs_extended_time": True,
            "needs_tts": True,
            "needs_breaks": True,
        }
        result = _derive_accommodations_from_signals(signals, "SUPPORTED")
        assert "extended_time" in result
        assert "text_to_speech" in result
        assert "sensory_breaks" in result


class TestCloneBrain:
    @pytest.mark.asyncio
    async def test_clone_brain_success(self, session, model_store):
        result = await clone_brain(
            session=session,
            model_store=model_store,
            learner_id=str(uuid.uuid4()),
            assessment_id=str(uuid.uuid4()),
            domains={"MATH": 0.6, "ELA": 0.4},
            functioning_level="STANDARD",
            enrolled_grade=3,
        )

        assert "brain_state_id" in result
        assert result["functioning_level"] == "STANDARD"
        assert result["main_brain_version"] == "aivo-brain-v3.0"

    @pytest.mark.asyncio
    async def test_clone_with_iep(self, session, model_store):
        result = await clone_brain(
            session=session,
            model_store=model_store,
            learner_id=str(uuid.uuid4()),
            assessment_id=str(uuid.uuid4()),
            domains={"MATH": 0.3},
            functioning_level="LOW_VERBAL",
            enrolled_grade=5,
            iep_profile={"has_iep": True},
            iep_goals=[{"id": "g1", "domain": "MATH", "target_metric": "mastery"}],
            iep_accommodations=["extended_time"],
        )

        assert result["functioning_level"] == "LOW_VERBAL"

    @pytest.mark.asyncio
    async def test_clone_functional_curriculum(self, session, model_store):
        result = await clone_brain(
            session=session,
            model_store=model_store,
            learner_id=str(uuid.uuid4()),
            assessment_id=str(uuid.uuid4()),
            domains={"COMMUNICATION": 0.1},
            functioning_level="PRE_SYMBOLIC",
            enrolled_grade=1,
        )

        assert result["functioning_level"] == "PRE_SYMBOLIC"
