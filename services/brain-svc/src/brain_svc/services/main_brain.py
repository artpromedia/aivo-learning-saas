"""Main Brain seed management — CRUD + versioning for seed templates."""

from __future__ import annotations

import copy
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# The "main_brain_seeds" are stored in the brain_states table with a sentinel
# learner_id = NULL and a non-null seed_version.  For robustness we store
# templates as in-memory registry (populated on startup from DB or defaults).

# Default seed keyed by version string
_SEED_REGISTRY: dict[str, dict[str, Any]] = {}

# Accommodation defaults by functioning level
ACCOMMODATION_DEFAULTS: dict[str, list[str]] = {
    "STANDARD": [],
    "SUPPORTED": ["extended_time", "chunked_text"],
    "LOW_VERBAL": [
        "extended_time",
        "text_to_speech",
        "audio_narration",
        "chunked_text",
        "picture_support",
        "reduced_choices",
    ],
    "NON_VERBAL": [
        "extended_time",
        "text_to_speech",
        "audio_narration",
        "chunked_text",
        "picture_support",
        "reduced_choices",
        "large_touch_targets",
        "partner_assisted",
    ],
    "PRE_SYMBOLIC": [
        "extended_time",
        "text_to_speech",
        "audio_narration",
        "chunked_text",
        "picture_support",
        "reduced_choices",
        "large_touch_targets",
        "partner_assisted",
        "switch_scan",
        "sensory_breaks",
    ],
}

# Default mastery template per domain
DEFAULT_MASTERY_TEMPLATE: dict[str, float] = {
    "MATH": 0.1,
    "ELA": 0.1,
    "SCIENCE": 0.1,
    "SOCIAL_STUDIES": 0.1,
    "COMMUNICATION": 0.1,
    "SELF_CARE": 0.1,
    "SOCIAL_EMOTIONAL": 0.1,
    "PRE_ACADEMIC": 0.1,
    "MOTOR_SENSORY": 0.1,
}

# Delivery levels per grade band
DEFAULT_DELIVERY_LEVELS: dict[str, dict[str, str]] = {
    "K-2": {"reading_level": "EARLY", "math_level": "CONCRETE", "modality": "VISUAL_HEAVY"},
    "3-5": {"reading_level": "DEVELOPING", "math_level": "PICTORIAL", "modality": "BALANCED"},
    "6-8": {"reading_level": "INTERMEDIATE", "math_level": "ABSTRACT_INTRO", "modality": "TEXT_HEAVY"},
    "9-12": {"reading_level": "ADVANCED", "math_level": "ABSTRACT", "modality": "TEXT_PRIMARY"},
}


def _grade_to_band(grade: int) -> str:
    if grade <= 2:
        return "K-2"
    if grade <= 5:
        return "3-5"
    if grade <= 8:
        return "6-8"
    return "9-12"


DISTRICT_CURRICULUM_OVERRIDES: dict[str, dict[str, list[str]]] = {
    "COMMON_CORE": {
        "K-2": ["counting", "addition", "subtraction", "place_value", "phonics", "sight_words", "sentence_writing", "story_comprehension"],
        "3-5": ["multiplication", "fractions", "decimals", "multi_digit_operations", "reading_comprehension", "informational_text", "essay_writing", "grammar"],
        "6-8": ["ratios", "proportions", "algebra_intro", "geometry", "literary_analysis", "argument_writing", "research_skills"],
        "9-12": ["algebra", "functions", "statistics", "calculus_intro", "literature_analysis", "rhetorical_analysis", "research_papers"],
    },
    "TEKS": {
        "K-2": ["number_sense", "addition", "subtraction", "measurement_intro", "phonemic_awareness", "decoding", "vocabulary", "writing_conventions"],
        "3-5": ["multiplication", "division", "fractions", "geometry_2d_3d", "fluency", "comprehension_strategies", "composition", "spelling_patterns"],
        "6-8": ["proportional_reasoning", "algebraic_reasoning", "data_analysis", "personal_finance_intro", "literary_genres", "persuasive_writing", "research_process"],
        "9-12": ["algebra", "geometry_proofs", "statistics", "financial_literacy", "literary_criticism", "analytical_writing", "multimedia_presentations"],
    },
    "NYSLS": {
        "K-2": ["counting_cardinality", "operations_algebraic", "phonics", "print_concepts", "writing_narratives", "speaking_listening"],
        "3-5": ["number_operations_fractions", "measurement_data", "reading_literature", "reading_informational", "opinion_writing", "language_conventions"],
        "6-8": ["ratios", "expressions_equations", "text_analysis", "argument_writing", "speaking_presenting", "language_vocabulary"],
        "9-12": ["algebra", "functions", "modeling", "text_complexity", "evidence_based_writing", "research_synthesis"],
    },
    "BEST": {
        "K-2": ["number_sense_operations", "algebraic_reasoning", "foundational_reading", "communication", "vocabulary_acquisition", "writing_process"],
        "3-5": ["multi_digit_arithmetic", "fractions_decimals", "reading_prose_poetry", "reading_informational", "writing_arguments", "language_editing"],
        "6-8": ["ratios_proportional", "expressions_equations", "literary_analysis", "rhetorical_knowledge", "writing_across_genres", "vocabulary_context"],
        "9-12": ["algebra_functions", "geometry_trigonometry", "statistics_probability", "american_literature", "british_world_literature", "research_writing"],
    },
    "NGSS": {
        "K-2": ["forces_interactions", "ecosystems", "weather_climate", "engineering_design"],
        "3-5": ["matter_interactions", "energy", "earth_systems", "life_cycles"],
        "6-8": ["chemical_reactions", "forces_motion", "heredity", "earth_space"],
        "9-12": ["atomic_structure", "evolution", "climate_change", "engineering"],
    },
}


def build_default_seed(version: str = "aivo-brain-v3.0") -> dict[str, Any]:
    """Build the default Main Brain seed template."""
    return {
        "version": version,
        "mastery_template": copy.deepcopy(DEFAULT_MASTERY_TEMPLATE),
        "accommodation_defaults": copy.deepcopy(ACCOMMODATION_DEFAULTS),
        "delivery_levels": copy.deepcopy(DEFAULT_DELIVERY_LEVELS),
        "curriculum_alignment": {
            "K-2": ["counting", "phonics", "basic_shapes", "colors"],
            "3-5": ["multiplication", "reading_comprehension", "basic_science"],
            "6-8": ["algebra", "essay_writing", "scientific_method"],
            "9-12": ["calculus", "literature_analysis", "advanced_science"],
        },
        "district_curriculum_overrides": copy.deepcopy(DISTRICT_CURRICULUM_OVERRIDES),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def register_seed(seed: dict[str, Any]) -> None:
    """Register a seed in the in-memory registry."""
    version = seed["version"]
    _SEED_REGISTRY[version] = seed
    logger.info("Registered Main Brain seed version: %s", version)


def get_seed(version: str) -> dict[str, Any] | None:
    """Get a seed by version."""
    return _SEED_REGISTRY.get(version)


def get_latest_seed() -> dict[str, Any]:
    """Get the latest seed version."""
    if not _SEED_REGISTRY:
        seed = build_default_seed()
        register_seed(seed)
    # Latest = highest version string
    latest_version = sorted(_SEED_REGISTRY.keys())[-1]
    return _SEED_REGISTRY[latest_version]


def list_seeds() -> list[dict[str, Any]]:
    """List all registered seeds."""
    return list(_SEED_REGISTRY.values())


def create_seed(
    version: str,
    mastery_template: dict[str, float] | None = None,
    accommodation_defaults: dict[str, list[str]] | None = None,
    delivery_levels: dict[str, dict[str, str]] | None = None,
    curriculum_alignment: dict[str, list[str]] | None = None,
) -> dict[str, Any]:
    """Create and register a new seed version."""
    base = build_default_seed(version)
    if mastery_template:
        base["mastery_template"] = mastery_template
    if accommodation_defaults:
        base["accommodation_defaults"] = accommodation_defaults
    if delivery_levels:
        base["delivery_levels"] = delivery_levels
    if curriculum_alignment:
        base["curriculum_alignment"] = curriculum_alignment
    register_seed(base)
    return base


def resolve_seed_for_learner(
    enrolled_grade: int,
    functioning_level: str,
    curriculum_framework: str | None = None,
) -> dict[str, Any]:
    """Select and customize a seed for a specific learner profile.

    When a curriculum_framework is provided (e.g. from the learner's school
    district), the active_curriculum is sourced from district-specific
    standards instead of the generic default alignment.
    """
    seed = get_latest_seed()
    grade_band = _grade_to_band(enrolled_grade)

    result = copy.deepcopy(seed)
    result["resolved_grade_band"] = grade_band
    result["resolved_functioning_level"] = functioning_level
    result["active_delivery_levels"] = seed["delivery_levels"].get(grade_band, {})
    result["active_accommodations"] = seed["accommodation_defaults"].get(functioning_level, [])

    if curriculum_framework and curriculum_framework in DISTRICT_CURRICULUM_OVERRIDES:
        override = DISTRICT_CURRICULUM_OVERRIDES[curriculum_framework]
        result["active_curriculum"] = override.get(grade_band, [])
        result["curriculum_framework"] = curriculum_framework
        logger.info(
            "Resolved curriculum from district framework %s for grade band %s: %d skills",
            curriculum_framework,
            grade_band,
            len(result["active_curriculum"]),
        )
    else:
        result["active_curriculum"] = seed["curriculum_alignment"].get(grade_band, [])
        result["curriculum_framework"] = "DEFAULT"

    return result


# Initialize default seed on module load
register_seed(build_default_seed())
