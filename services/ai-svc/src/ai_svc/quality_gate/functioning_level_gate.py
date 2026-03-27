"""Gate 3b: Functioning level compliance — enforces FL-specific content rules."""

from __future__ import annotations

import re

from ai_svc.quality_gate.types import GateResult
from ai_svc.prompts.functioning_level_rules import get_max_sentences_per_block, get_max_choices


def check_functioning_level_compliance(
    content: str,
    functioning_level: str,
) -> GateResult:
    """Check if content meets functioning-level-specific requirements."""
    if functioning_level == "STANDARD":
        return GateResult(
            name="functioning_level_compliance",
            passed=True,
            details="STANDARD level — no additional constraints",
        )

    violations: list[str] = []

    max_sentences = get_max_sentences_per_block(functioning_level)
    max_choices = get_max_choices(functioning_level)

    if functioning_level == "LOW_VERBAL":
        violations.extend(_check_low_verbal(content, max_sentences, max_choices))
    elif functioning_level == "NON_VERBAL":
        violations.extend(_check_non_verbal(content))
    elif functioning_level == "PRE_SYMBOLIC":
        violations.extend(_check_pre_symbolic(content))
    elif functioning_level == "SUPPORTED":
        violations.extend(_check_supported(content))

    passed = len(violations) == 0
    return GateResult(
        name="functioning_level_compliance",
        passed=passed,
        details="; ".join(violations) if violations else f"{functioning_level} compliance verified",
        metadata={
            "functioning_level": functioning_level,
            "violations": violations,
        },
    )


def _count_sentences(text: str) -> int:
    """Count sentences in a text block."""
    sentences = re.split(r"[.!?]+", text)
    return len([s for s in sentences if s.strip() and len(s.strip()) > 2])


def _check_low_verbal(content: str, max_sentences: int, max_choices: int) -> list[str]:
    """LOW_VERBAL: max 1 sentence per block, 2 choices, pictures required."""
    violations: list[str] = []

    # Check sentence count per block
    blocks = content.split("\n\n")
    for i, block in enumerate(blocks):
        if block.startswith("#") or block.startswith("["):
            continue
        sentence_count = _count_sentences(block)
        if sentence_count > max_sentences:
            violations.append(
                f"Block {i+1} has {sentence_count} sentences — "
                f"LOW_VERBAL maximum is {max_sentences}"
            )
            break  # Report first violation only

    # Check choice count
    choice_matches = re.findall(r"(?:^|\n)\s*[A-Za-z0-9]\s*[\)\.]\s*", content)
    if len(choice_matches) > max_choices:
        violations.append(
            f"Found {len(choice_matches)} choices — LOW_VERBAL maximum is {max_choices}"
        )

    # Picture support required
    if "[PICTURE:" not in content and len(content) > 30:
        violations.append("LOW_VERBAL requires [PICTURE: ...] markers with all text")

    return violations


def _check_non_verbal(content: str) -> list[str]:
    """NON_VERBAL: dual output (learner + facilitator guide) required."""
    violations: list[str] = []

    content_lower = content.lower()
    has_facilitator = any(
        marker in content_lower
        for marker in ["facilitator", "adult guide", "caregiver guide", "partner guide"]
    )
    if not has_facilitator:
        violations.append("NON_VERBAL requires dual output with adult facilitator guide")

    if "cause" not in content_lower and "effect" not in content_lower and "when" not in content_lower:
        violations.append("NON_VERBAL requires cause-and-effect format")

    return violations


def _check_pre_symbolic(content: str) -> list[str]:
    """PRE_SYMBOLIC: adult-directed only, observational checklist required."""
    violations: list[str] = []

    content_lower = content.lower()
    has_adult_directed = any(
        marker in content_lower
        for marker in ["adult", "facilitator", "caregiver", "partner", "guide"]
    )
    if not has_adult_directed:
        violations.append("PRE_SYMBOLIC content must be adult-directed")

    has_checklist = "[ ]" in content or "checklist" in content_lower or "observe" in content_lower
    if not has_checklist:
        violations.append("PRE_SYMBOLIC requires observational checklist")

    return violations


def _check_supported(content: str) -> list[str]:
    """SUPPORTED: max 4 sentences per block."""
    violations: list[str] = []
    max_sentences = get_max_sentences_per_block("SUPPORTED")

    blocks = content.split("\n\n")
    for i, block in enumerate(blocks):
        if block.startswith("#") or block.startswith("["):
            continue
        sentence_count = _count_sentences(block)
        if sentence_count > max_sentences:
            violations.append(
                f"Block {i+1} has {sentence_count} sentences — "
                f"SUPPORTED maximum is {max_sentences}"
            )
            break

    return violations
