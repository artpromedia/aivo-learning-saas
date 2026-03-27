"""Gate 1: Safety — screen for harmful, inappropriate, or age-inappropriate content."""

from __future__ import annotations

import re
from ai_svc.quality_gate.types import GateResult

# Harmful content patterns (regex-based fast classifier)
_UNSAFE_PATTERNS = [
    r"\b(kill|murder|suicide|self[- ]?harm|cutting)\b",
    r"\b(sex|sexual|nude|naked|porn)\b",
    r"\b(drug|cocaine|heroin|meth|marijuana)\s+(use|abuse)",
    r"\b(gun|weapon|bomb|explosive)\s+(make|build|create|how\s+to)",
    r"\b(hate|racist|sexist|bigot)\b",
    r"\b(damn|shit|fuck|ass|bitch|hell)\b",
    r"\b(terroris[mt]|extremis[mt])\b",
    r"\bgore\b",
]

_COMPILED_UNSAFE = [re.compile(p, re.IGNORECASE) for p in _UNSAFE_PATTERNS]

# Age-inappropriate topics
_AGE_INAPPROPRIATE = [
    r"\b(alcohol|beer|wine|vodka|drunk)\b.*\b(fun|cool|try)\b",
    r"\b(gambling|casino|bet)\b",
    r"\bdating\s+(tips|advice)\b",
]

_COMPILED_AGE = [re.compile(p, re.IGNORECASE) for p in _AGE_INAPPROPRIATE]


def check_safety(content: str) -> GateResult:
    """Check content for harmful or age-inappropriate material.

    Uses fast regex-based classification.
    """
    # Check for unsafe patterns
    for pattern in _COMPILED_UNSAFE:
        match = pattern.search(content)
        if match:
            return GateResult(
                name="safety",
                passed=False,
                details=f"Unsafe content detected: matched pattern near '{match.group()}'",
                metadata={"trigger": match.group(), "position": match.start()},
            )

    # Check age-inappropriate content
    for pattern in _COMPILED_AGE:
        match = pattern.search(content)
        if match:
            return GateResult(
                name="safety",
                passed=False,
                details=f"Age-inappropriate content detected near '{match.group()}'",
                metadata={"trigger": match.group()},
            )

    return GateResult(
        name="safety",
        passed=True,
        details="Content passed safety checks",
    )
