"""Multi-gate validation orchestrator."""

from __future__ import annotations

import logging
from typing import Any

from ai_svc.quality_gate.types import GateResult, QualityResult
from ai_svc.quality_gate.safety_gate import check_safety
from ai_svc.quality_gate.readability_gate import check_readability
from ai_svc.quality_gate.accommodation_gate import check_accommodation_compliance
from ai_svc.quality_gate.functioning_level_gate import check_functioning_level_compliance

logger = logging.getLogger(__name__)


class QualityGatePipeline:
    """Orchestrates all quality gates on generated content."""

    def validate(
        self,
        content: str,
        learner_context: dict[str, Any],
    ) -> QualityResult:
        """Run all quality gates on the content.

        Args:
            content: Generated LLM content to validate.
            learner_context: Learner profile for context-specific checks.

        Returns:
            QualityResult with gate-by-gate pass/fail and validated content.
        """
        gates: list[GateResult] = []
        all_passed = True

        # Gate 1: Safety
        safety = check_safety(content)
        gates.append(safety)
        if not safety.passed:
            all_passed = False

        # Gate 2: Readability
        delivery_level = learner_context.get("delivery_levels", {})
        grade = learner_context.get("enrolled_grade", 5)
        readability = check_readability(content, grade, delivery_level)
        gates.append(readability)
        if not readability.passed:
            all_passed = False

        # Gate 3: Accommodation compliance
        accommodations = learner_context.get("active_accommodations", [])
        acc_result = check_accommodation_compliance(content, accommodations)
        gates.append(acc_result)
        if not acc_result.passed:
            all_passed = False

        # Gate 3b: Functioning level compliance
        functioning_level = learner_context.get("functioning_level", "STANDARD")
        fl_result = check_functioning_level_compliance(content, functioning_level)
        gates.append(fl_result)
        if not fl_result.passed:
            all_passed = False

        return QualityResult(
            passed=all_passed,
            gates=gates,
            content=content if all_passed else "",
        )
