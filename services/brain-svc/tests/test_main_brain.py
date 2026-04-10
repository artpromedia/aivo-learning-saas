"""Tests for main brain seed management."""

from __future__ import annotations

import pytest

from brain_svc.services.main_brain import (
    ACCOMMODATION_DEFAULTS,
    DEFAULT_DELIVERY_LEVELS,
    DEFAULT_MASTERY_TEMPLATE,
    build_default_seed,
    create_seed,
    get_latest_seed,
    get_seed,
    list_seeds,
    register_seed,
    resolve_seed_for_learner,
)


class TestSeedRegistry:
    def test_default_seed_structure(self):
        seed = build_default_seed()
        assert seed["version"] == "aivo-brain-v3.0"
        assert "mastery_template" in seed
        assert "accommodation_defaults" in seed
        assert "delivery_levels" in seed
        assert "curriculum_alignment" in seed

    def test_register_and_get_seed(self):
        seed = build_default_seed("test-v1")
        register_seed(seed)
        retrieved = get_seed("test-v1")
        assert retrieved is not None
        assert retrieved["version"] == "test-v1"

    def test_get_latest_seed(self):
        seed = get_latest_seed()
        assert seed is not None
        assert "version" in seed

    def test_list_seeds(self):
        seeds = list_seeds()
        assert len(seeds) >= 1

    def test_create_seed_custom(self):
        seed = create_seed(
            "custom-v1",
            mastery_template={"MATH": 0.2, "ELA": 0.2},
        )
        assert seed["version"] == "custom-v1"
        assert seed["mastery_template"]["MATH"] == 0.2

    def test_accommodation_defaults(self):
        assert ACCOMMODATION_DEFAULTS["STANDARD"] == []
        assert len(ACCOMMODATION_DEFAULTS["PRE_SYMBOLIC"]) == 10
        assert "text_to_speech" in ACCOMMODATION_DEFAULTS["LOW_VERBAL"]

    def test_mastery_template(self):
        assert "MATH" in DEFAULT_MASTERY_TEMPLATE
        assert all(v == 0.1 for v in DEFAULT_MASTERY_TEMPLATE.values())

    def test_delivery_levels(self):
        assert "K-2" in DEFAULT_DELIVERY_LEVELS
        assert "9-12" in DEFAULT_DELIVERY_LEVELS


class TestResolveSeed:
    def test_resolve_k2(self):
        result = resolve_seed_for_learner(1, "STANDARD")
        assert result["resolved_grade_band"] == "K-2"
        assert result["resolved_functioning_level"] == "STANDARD"

    def test_resolve_35(self):
        result = resolve_seed_for_learner(4, "SUPPORTED")
        assert result["resolved_grade_band"] == "3-5"

    def test_resolve_68(self):
        result = resolve_seed_for_learner(7, "LOW_VERBAL")
        assert result["resolved_grade_band"] == "6-8"

    def test_resolve_912(self):
        result = resolve_seed_for_learner(10, "STANDARD")
        assert result["resolved_grade_band"] == "9-12"

    def test_resolve_includes_accommodations(self):
        result = resolve_seed_for_learner(3, "NON_VERBAL")
        assert len(result["active_accommodations"]) > 0
        assert "partner_assisted" in result["active_accommodations"]

    def test_resolve_with_common_core_framework(self):
        result = resolve_seed_for_learner(4, "STANDARD", curriculum_framework="COMMON_CORE")
        assert result["curriculum_framework"] == "COMMON_CORE"
        assert "multiplication" in result["active_curriculum"]
        assert "fractions" in result["active_curriculum"]

    def test_resolve_with_teks_framework(self):
        result = resolve_seed_for_learner(1, "SUPPORTED", curriculum_framework="TEKS")
        assert result["curriculum_framework"] == "TEKS"
        assert "number_sense" in result["active_curriculum"]

    def test_resolve_with_unknown_framework_falls_back(self):
        result = resolve_seed_for_learner(4, "STANDARD", curriculum_framework="UNKNOWN_STATE")
        assert result["curriculum_framework"] == "DEFAULT"
        assert result["active_curriculum"] == ["multiplication", "reading_comprehension", "basic_science"]

    def test_resolve_without_framework_uses_default(self):
        result = resolve_seed_for_learner(4, "STANDARD")
        assert result["curriculum_framework"] == "DEFAULT"
