"""Tests for ML engine — BaseBrainModel, MasteryEngine, DifficultyAdapter."""

from __future__ import annotations

import copy
import time

import pytest
import torch

from brain_svc.ml.base_brain_model import (
    FUNCTIONING_LEVEL_MAP,
    BaseBrainModel,
    SelfAttentionBlock,
)
from brain_svc.ml.difficulty_adapter import (
    DifficultyProfile,
    compute_difficulty_profile,
    get_difficulty_for_step,
)
from brain_svc.ml.mastery_engine import (
    BKTParams,
    MasteryEngine,
    MasteryUpdate,
    SM2State,
    SkillMastery,
    sm2_update,
)


class TestBaseBrainModel:
    def test_model_forward_shape(self):
        model = BaseBrainModel()
        batch, seq = 2, 5
        skill_ids = torch.randint(0, 512, (batch, seq))
        fl_ids = torch.randint(0, 5, (batch, seq))
        numeric = torch.randn(batch, seq, 4)
        output = model(skill_ids, fl_ids, numeric)
        assert output.shape == (batch, seq)

    def test_model_output_range(self):
        model = BaseBrainModel()
        skill_ids = torch.tensor([[0, 1, 2]])
        fl_ids = torch.tensor([[0, 1, 2]])
        numeric = torch.randn(1, 3, 4)
        output = model(skill_ids, fl_ids, numeric)
        assert (output >= 0.0).all() and (output <= 1.0).all()

    def test_model_eval_mode(self):
        model = BaseBrainModel()
        model.eval()
        with torch.no_grad():
            skill_ids = torch.tensor([[0]])
            fl_ids = torch.tensor([[0]])
            numeric = torch.zeros(1, 1, 4)
            out1 = model(skill_ids, fl_ids, numeric).item()
            out2 = model(skill_ids, fl_ids, numeric).item()
        assert out1 == out2

    def test_functioning_level_map(self):
        assert FUNCTIONING_LEVEL_MAP["STANDARD"] == 0
        assert FUNCTIONING_LEVEL_MAP["PRE_SYMBOLIC"] == 4
        assert len(FUNCTIONING_LEVEL_MAP) == 5


class TestSelfAttention:
    def test_attention_shape(self):
        attn = SelfAttentionBlock(embed_dim=16)
        x = torch.randn(2, 5, 16)
        out = attn(x)
        assert out.shape == x.shape


class TestBKT:
    def test_bkt_correct_increases_mastery(self):
        engine = MasteryEngine(BaseBrainModel())
        p = engine.bkt_update("test_skill", 0.3, is_correct=True)
        assert p > 0.3

    def test_bkt_incorrect_decreases_mastery(self):
        engine = MasteryEngine(BaseBrainModel())
        p = engine.bkt_update("test_skill", 0.8, is_correct=False)
        assert p < 0.8

    def test_bkt_bounds(self):
        engine = MasteryEngine(BaseBrainModel())
        p = engine.bkt_update("test_skill", 0.0, is_correct=True)
        assert 0.0 <= p <= 1.0
        p = engine.bkt_update("test_skill", 1.0, is_correct=False)
        assert 0.0 <= p <= 1.0


class TestSM2:
    def test_sm2_high_quality_extends_interval(self):
        state = SM2State()
        updated = sm2_update(state, 5)
        assert updated.interval >= 1.0
        assert updated.repetitions == 1

    def test_sm2_low_quality_resets(self):
        state = SM2State(interval=10.0, repetitions=5)
        updated = sm2_update(state, 1)
        assert updated.repetitions == 0
        assert updated.interval == 1.0

    def test_sm2_easiness_floor(self):
        state = SM2State(easiness=1.3)
        updated = sm2_update(state, 0)
        assert updated.easiness >= 1.3

    def test_sm2_quality_clamped(self):
        state = SM2State()
        result = sm2_update(state, 10)  # clamped to 5
        assert result.repetitions == 1


class TestMasteryEngine:
    def test_update_mastery_correct(self):
        engine = MasteryEngine(BaseBrainModel())
        masteries: dict[str, SkillMastery] = {}
        result = engine.update_mastery(
            masteries, "MATH", is_correct=True,
            difficulty=0.5, functioning_level="STANDARD", timestamp=time.time(),
        )
        assert result.new_level > result.previous_level
        assert result.delta > 0
        assert "MATH" in masteries

    def test_update_mastery_incorrect(self):
        engine = MasteryEngine(BaseBrainModel())
        masteries = {"MATH": SkillMastery(skill_id="MATH", p_known=0.8, attempts=10, correct_count=8)}
        result = engine.update_mastery(
            masteries, "MATH", is_correct=False,
            difficulty=0.5, functioning_level="STANDARD", timestamp=time.time(),
        )
        assert result.new_level < result.previous_level

    def test_batch_update(self):
        engine = MasteryEngine(BaseBrainModel())
        masteries: dict[str, SkillMastery] = {}
        interactions = [
            {"skill": "MATH", "is_correct": True, "difficulty": 0.5, "timestamp": time.time()},
            {"skill": "ELA", "is_correct": False, "difficulty": 0.3, "timestamp": time.time()},
            {"skill": "MATH", "is_correct": True, "difficulty": 0.6, "timestamp": time.time()},
        ]
        results = engine.batch_update(masteries, interactions, "STANDARD")
        assert len(results) == 3
        assert results[0].skill == "MATH"
        assert "MATH" in masteries
        assert "ELA" in masteries

    def test_clone(self):
        engine = MasteryEngine(BaseBrainModel())
        masteries: dict[str, SkillMastery] = {}
        engine.update_mastery(
            masteries, "MATH", True, 0.5, "STANDARD", time.time(),
        )
        cloned = engine.clone()
        # Cloned engine should have same params but be independent
        assert engine._bkt_params.keys() == cloned._bkt_params.keys()
        cloned._bkt_params["MATH"].p_transit = 0.99
        assert engine._bkt_params["MATH"].p_transit != 0.99


class TestDifficultyAdapter:
    def test_on_grade(self):
        profile = compute_difficulty_profile(3, 1.0, "STANDARD")
        assert profile.delivery_level == "ON_GRADE"
        assert profile.gap < 0.5

    def test_supported(self):
        profile = compute_difficulty_profile(5, 0.85, "STANDARD")
        assert profile.delivery_level == "SUPPORTED"

    def test_scaffolded(self):
        profile = compute_difficulty_profile(5, 0.7, "STANDARD")
        assert profile.delivery_level == "SCAFFOLDED"

    def test_remedial(self):
        profile = compute_difficulty_profile(8, 0.7, "STANDARD")
        assert profile.delivery_level == "REMEDIAL"

    def test_foundational(self):
        profile = compute_difficulty_profile(8, 0.3, "STANDARD")
        assert profile.delivery_level == "FOUNDATIONAL"

    def test_fl_multiplier(self):
        profile_standard = compute_difficulty_profile(5, 1.0, "STANDARD")
        profile_low = compute_difficulty_profile(5, 1.0, "LOW_VERBAL")
        assert profile_low.target_difficulty < profile_standard.target_difficulty

    def test_get_difficulty_for_step(self):
        profile = compute_difficulty_profile(5, 0.4, "STANDARD")
        d1 = get_difficulty_for_step(profile, 0)
        d2 = get_difficulty_for_step(profile, 3)
        # Later steps should be harder
        assert d2 >= d1
