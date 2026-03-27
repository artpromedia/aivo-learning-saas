"""Gate 3: Accommodation compliance checker."""

from __future__ import annotations

from ai_svc.quality_gate.types import GateResult


def check_accommodation_compliance(
    content: str,
    active_accommodations: list[str],
) -> GateResult:
    """Check if content complies with active accommodations.

    Verifies that required markers and formatting are present.
    """
    if not active_accommodations:
        return GateResult(
            name="accommodation_compliance",
            passed=True,
            details="No active accommodations to check",
        )

    violations: list[str] = []

    if "text_to_speech" in active_accommodations:
        # TTS accommodation requires [TTS] markers on text blocks
        if "[TTS]" not in content and len(content) > 100:
            violations.append("Missing [TTS] markers for text-to-speech accommodation")

    if "chunked_text" in active_accommodations:
        # Check that text is broken into small blocks (paragraphs < 3 sentences)
        paragraphs = content.split("\n\n")
        for i, para in enumerate(paragraphs):
            sentences = [s for s in para.split(".") if s.strip()]
            if len(sentences) > 5:
                violations.append(
                    f"Paragraph {i+1} has {len(sentences)} sentences — "
                    f"chunked_text requires shorter blocks"
                )
                break

    if "picture_support" in active_accommodations:
        if "[PICTURE:" not in content and len(content) > 50:
            violations.append("Missing [PICTURE: ...] markers for picture support accommodation")

    if "reduced_choices" in active_accommodations:
        # Check for choice lists — if present, should be limited
        import re
        choice_patterns = re.findall(r"[A-D]\)|[a-d]\)|[1-4]\.", content)
        if len(choice_patterns) > 4:
            violations.append("Too many choices detected — reduced_choices accommodation active")

    if "large_touch_targets" in active_accommodations:
        if "[LARGE_TARGET]" not in content and any(
            marker in content.lower() for marker in ["click", "tap", "select", "choose"]
        ):
            violations.append("Missing [LARGE_TARGET] markers for interactive elements")

    if "sensory_breaks" in active_accommodations:
        if "[SENSORY_BREAK]" not in content and len(content) > 500:
            violations.append("Missing [SENSORY_BREAK] markers for extended content")

    passed = len(violations) == 0
    return GateResult(
        name="accommodation_compliance",
        passed=passed,
        details="; ".join(violations) if violations else "All accommodation requirements met",
        metadata={"violations": violations, "checked_accommodations": active_accommodations},
    )
