"""Grade gap scaffolding — difficulty adapter (Section 9.3).

When a learner's performance grade significantly differs from their
enrolled grade, the adapter scales content difficulty to bridge the gap
while maintaining engagement through scaffolding.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class DifficultyProfile:
    """Computed difficulty profile for a learner in a domain."""

    enrolled_grade: int
    performance_grade: float
    gap: float
    target_difficulty: float
    scaffold_steps: int
    delivery_level: str


# Content delivery level rules per gap size
_DELIVERY_RULES = [
    (0.0, "ON_GRADE"),        # gap < 0.5
    (0.5, "SUPPORTED"),       # gap 0.5–1.0
    (1.0, "SCAFFOLDED"),      # gap 1.0–2.0
    (2.0, "REMEDIAL"),        # gap 2.0–3.0
    (3.0, "FOUNDATIONAL"),    # gap 3.0+
]

# Functioning level difficulty multipliers
_FL_MULTIPLIERS: dict[str, float] = {
    "STANDARD": 1.0,
    "SUPPORTED": 0.85,
    "LOW_VERBAL": 0.7,
    "NON_VERBAL": 0.55,
    "PRE_SYMBOLIC": 0.4,
}


def compute_difficulty_profile(
    enrolled_grade: int,
    domain_mastery: float,
    functioning_level: str,
) -> DifficultyProfile:
    """Compute the difficulty profile for a learner in a domain.

    Args:
        enrolled_grade: The grade the learner is enrolled in (1–12).
        domain_mastery: Current mastery level for the domain (0.0–1.0).
        functioning_level: The learner's functioning level.

    Returns:
        A DifficultyProfile with scaffolding parameters.
    """
    # Estimate performance grade from mastery
    performance_grade = enrolled_grade * domain_mastery
    gap = abs(enrolled_grade - performance_grade)

    # Determine delivery level from gap
    delivery_level = "ON_GRADE"
    for threshold, level in reversed(_DELIVERY_RULES):
        if gap >= threshold:
            delivery_level = level
            break

    # Apply functioning level multiplier
    fl_mult = _FL_MULTIPLIERS.get(functioning_level, 1.0)

    # Target difficulty: blend performance with enrolled grade, scaled by FL
    target_difficulty = max(0.1, min(1.0, domain_mastery * fl_mult))

    # Scaffold steps: how many incremental difficulty levels to bridge
    scaffold_steps = max(1, int(gap * 2))

    return DifficultyProfile(
        enrolled_grade=enrolled_grade,
        performance_grade=performance_grade,
        gap=gap,
        target_difficulty=target_difficulty,
        scaffold_steps=scaffold_steps,
        delivery_level=delivery_level,
    )


def get_difficulty_for_step(profile: DifficultyProfile, step: int) -> float:
    """Get the difficulty level for a specific scaffold step.

    Args:
        profile: The difficulty profile.
        step: Current step (0-indexed, 0 = easiest).

    Returns:
        Difficulty level between the current performance and target.
    """
    if profile.scaffold_steps <= 1:
        return profile.target_difficulty

    progress = min(step / (profile.scaffold_steps - 1), 1.0)
    base = profile.target_difficulty * 0.5
    return base + (profile.target_difficulty - base) * progress
