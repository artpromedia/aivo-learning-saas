"""Multi-gate validation orchestrator."""

from __future__ import annotations

import logging
import re
from typing import Any

from ai_svc.quality_gate.types import GateResult, QualityResult
from ai_svc.quality_gate.safety_gate import check_safety, _COMPILED_PII
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
        violations: list[str] = []
        all_passed = True
        auto_remediated = False
        working_content = content

        # Gate 1: Safety
        safety = check_safety(working_content)
        gates.append(safety)
        if not safety.passed:
            all_passed = False
            violations.append(f"safety: {safety.details}")
            # Auto-remediate PII by redacting
            if safety.metadata.get("pii_type"):
                working_content = self._redact_pii(working_content)
                auto_remediated = True
                # Re-check after remediation
                safety_recheck = check_safety(working_content)
                if safety_recheck.passed:
                    gates[-1] = safety_recheck
                    all_passed = True
                    violations[-1] = f"safety: PII auto-redacted"

        # Gate 2: Readability
        delivery_level = learner_context.get("delivery_levels", {})
        grade = learner_context.get("enrolled_grade", 5)
        readability = check_readability(working_content, grade, delivery_level)
        gates.append(readability)
        if not readability.passed:
            all_passed = False
            violations.append(f"readability: {readability.details}")

        # Gate 3: Accommodation compliance
        accommodations = learner_context.get("active_accommodations", [])
        acc_result = check_accommodation_compliance(working_content, accommodations)
        gates.append(acc_result)
        if not acc_result.passed:
            all_passed = False
            violations.append(f"accommodation: {acc_result.details}")

        # Gate 3b: Functioning level compliance
        functioning_level = learner_context.get("functioning_level", "STANDARD")
        fl_result = check_functioning_level_compliance(working_content, functioning_level)
        gates.append(fl_result)
        if not fl_result.passed:
            all_passed = False
            violations.append(f"functioning_level: {fl_result.details}")

        return QualityResult(
            passed=all_passed,
            gates=gates,
            content=working_content if all_passed else "",
            violations=violations,
            auto_remediated=auto_remediated,
        )

    @staticmethod
    def _redact_pii(content: str) -> str:
        """Replace detected PII with redaction markers."""
        result = content
        for pattern, label in _COMPILED_PII:
            if label == "email address":
                result = pattern.sub("[EMAIL REDACTED]", result)
            elif label == "SSN":
                result = pattern.sub("[SSN REDACTED]", result)
            elif label == "phone number":
                result = pattern.sub("[PHONE REDACTED]", result)
            elif label == "full name":
                result = pattern.sub("[NAME REDACTED]", result)
        return result
