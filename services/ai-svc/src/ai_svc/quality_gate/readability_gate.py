"""Gate 2: Readability — vocabulary + sentence complexity vs delivery level."""

from __future__ import annotations

import re
from typing import Any

from ai_svc.quality_gate.types import GateResult

# Target grade levels for delivery levels
_DELIVERY_GRADE_MAP: dict[str, float] = {
    "EARLY": 1.5,
    "DEVELOPING": 3.0,
    "INTERMEDIATE": 6.0,
    "ADVANCED": 9.0,
}

# Readability tolerance — content can be this many grade levels ABOVE target
_GRADE_TOLERANCE = 1.5


def _count_syllables(word: str) -> int:
    """Count syllables in a word using a simple heuristic."""
    word = word.lower().strip()
    if not word:
        return 0
    # Try pyphen first
    try:
        import pyphen
        dic = pyphen.Pyphen(lang="en_US")
        hyphenated = dic.inserted(word)
        return max(1, hyphenated.count("-") + 1)
    except Exception:
        pass
    # Fallback heuristic
    count = 0
    vowels = "aeiouy"
    prev_vowel = False
    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel
    if word.endswith("e") and count > 1:
        count -= 1
    return max(1, count)


def _flesch_kincaid_grade(text: str) -> float:
    """Calculate Flesch-Kincaid Grade Level for text."""
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if not sentences:
        return 0.0

    words = re.findall(r"[a-zA-Z']+", text)
    if not words:
        return 0.0

    total_sentences = len(sentences)
    total_words = len(words)
    total_syllables = sum(_count_syllables(w) for w in words)

    # FK formula
    grade = (
        0.39 * (total_words / total_sentences)
        + 11.8 * (total_syllables / total_words)
        - 15.59
    )
    return max(0.0, grade)


def check_readability(
    content: str,
    enrolled_grade: int,
    delivery_levels: dict[str, Any],
) -> GateResult:
    """Check if content readability matches the learner's delivery level."""
    # Determine target grade from delivery level
    reading_level = delivery_levels.get("reading_level", "")
    target_grade = _DELIVERY_GRADE_MAP.get(reading_level, float(enrolled_grade))

    # Calculate actual readability
    fk_grade = _flesch_kincaid_grade(content)

    # Check if content is too complex
    max_allowed = target_grade + _GRADE_TOLERANCE
    passed = fk_grade <= max_allowed

    return GateResult(
        name="readability",
        passed=passed,
        details=(
            f"FK grade level: {fk_grade:.1f}, "
            f"target: {target_grade:.1f}, "
            f"max allowed: {max_allowed:.1f}"
        ),
        metadata={
            "fk_grade": round(fk_grade, 1),
            "target_grade": target_grade,
            "max_allowed": max_allowed,
        },
    )
