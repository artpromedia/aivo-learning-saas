"""Tests for ai_svc.vision.subject_detector.SubjectDetector."""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest

from ai_svc.vision.subject_detector import (
    SubjectDetector,
    DetectedSubject,
    VALID_SUBJECTS,
)


# ── Helpers ──────────────────────────────────────────────────────────────

@dataclass
class _FakeLLMResponse:
    content: str
    model: str = "test-model"
    prompt_tokens: int = 10
    completion_tokens: int = 10
    total_tokens: int = 20
    latency_ms: float = 100.0


def _make_mock_gateway(response_content: str = '{"subject": "OTHER", "confidence": 0.5}'):
    """Create a mock LLMGateway that returns the given content."""
    gw = AsyncMock()
    gw.generate.return_value = _FakeLLMResponse(content=response_content)
    return gw


# ── Fixtures ─────────────────────────────────────────────────────────────

@pytest.fixture
def mock_gateway():
    return _make_mock_gateway()


@pytest.fixture
def detector(mock_gateway) -> SubjectDetector:
    return SubjectDetector(gateway=mock_gateway)


# ── Empty input ──────────────────────────────────────────────────────────

class TestEmptyInput:
    async def test_empty_string_returns_other(self, detector: SubjectDetector):
        result = await detector.detect("")
        assert result.subject == "OTHER"
        assert result.confidence == 0.0
        assert result.method == "pattern"

    async def test_whitespace_returns_other(self, detector: SubjectDetector):
        result = await detector.detect("   \n  ")
        assert result.subject == "OTHER"
        assert result.confidence == 0.0


# ── Math detection ───────────────────────────────────────────────────────

class TestMathDetection:
    async def test_equation_keywords(self):
        """Dense math text scores high enough for pattern detection."""
        gw = _make_mock_gateway()
        detector = SubjectDetector(gateway=gw)
        text = (
            "Solve the equation: 3 + 5 = 8. Calculate the answer. "
            "Use algebra to find x = 10. Work with fractions and decimals. "
            "Multiply 4 * 3 and solve for the ratio and proportion."
        )
        result = await detector.detect(text)
        assert result.subject == "MATH"
        assert result.method == "pattern"

    async def test_arithmetic_expression(self):
        gw = _make_mock_gateway()
        detector = SubjectDetector(gateway=gw)
        text = (
            "What is 12 + 8? What is 15 - 3? What is 6 * 7? "
            "Subtract 4 from 10. Addition practice. Calculate 9 + 1. "
            "Solve 20 - 5 and multiply 3 * 8."
        )
        result = await detector.detect(text)
        assert result.subject == "MATH"

    async def test_algebra_terms(self):
        gw = _make_mock_gateway()
        detector = SubjectDetector(gateway=gw)
        text = (
            "Solve the equation for x = 5. Use algebra with fractions "
            "and decimals and ratios and proportions. Calculate the percent "
            "and graph the polynomial. Find the area of the triangle."
        )
        result = await detector.detect(text)
        assert result.subject == "MATH"

    async def test_geometry_terms(self):
        gw = _make_mock_gateway()
        detector = SubjectDetector(gateway=gw)
        text = (
            "Find the area and perimeter of the triangle. Calculate the angle. "
            "Measure the volume. Use the equation to solve for x = 10. "
            "Work with fractions and decimals and geometry."
        )
        result = await detector.detect(text)
        assert result.subject == "MATH"


# ── ELA detection ────────────────────────────────────────────────────────

class TestELADetection:
    async def test_reading_passage(self, detector: SubjectDetector):
        text = "Read the passage below. Write a paragraph about the main idea. Use vocabulary words."
        result = await detector.detect(text)
        assert result.subject == "ELA"

    async def test_grammar_terms(self, detector: SubjectDetector):
        text = (
            "Circle the noun in each sentence. Underline the verb. "
            "Identify the adjective. Check your grammar and spelling."
        )
        result = await detector.detect(text)
        assert result.subject == "ELA"

    async def test_writing_terms(self, detector: SubjectDetector):
        text = "Write an essay with a thesis and topic sentence. Use narrative form. Include a paragraph about fiction."
        result = await detector.detect(text)
        assert result.subject == "ELA"


# ── Science detection ────────────────────────────────────────────────────

class TestScienceDetection:
    async def test_experiment_keywords(self, detector: SubjectDetector):
        text = "Form a hypothesis for this experiment. Observe the chemical reaction."
        result = await detector.detect(text)
        assert result.subject == "SCIENCE"

    async def test_biology_terms(self):
        gw = _make_mock_gateway()
        detector = SubjectDetector(gateway=gw)
        text = (
            "Describe photosynthesis and the ecosystem. What is the habitat "
            "of this species? Form a hypothesis about the experiment. "
            "Observe the genetic evolution of the organism in the lab."
        )
        result = await detector.detect(text)
        assert result.subject == "SCIENCE"

    async def test_chemistry_terms(self, detector: SubjectDetector):
        text = "Label the molecule. Find the element on the periodic table. Describe the atom and electron."
        result = await detector.detect(text)
        assert result.subject == "SCIENCE"


# ── History detection ────────────────────────────────────────────────────

class TestHistoryDetection:
    async def test_president_and_war(self, detector: SubjectDetector):
        text = "Which president led during the war? Describe the civilization and empire."
        result = await detector.detect(text)
        assert result.subject == "HISTORY"

    async def test_government_terms(self, detector: SubjectDetector):
        text = "Explain the constitution and the amendment. Discuss the revolution and independence."
        result = await detector.detect(text)
        assert result.subject == "HISTORY"

    async def test_era_terms(self, detector: SubjectDetector):
        text = "Compare ancient and medieval civilizations. What happened during the renaissance in the 15th century?"
        result = await detector.detect(text)
        assert result.subject == "HISTORY"


# ── Coding detection ────────────────────────────────────────────────────

class TestCodingDetection:
    async def test_programming_terms(self, detector: SubjectDetector):
        text = "Write a function that returns a variable. Use a loop and print( the result. Debug the boolean."
        result = await detector.detect(text)
        assert result.subject == "CODING"

    async def test_algorithm_terms(self, detector: SubjectDetector):
        text = "Describe the algorithm in pseudocode. Import the array module. Use a list index to find the item."
        result = await detector.detect(text)
        assert result.subject == "CODING"


# ── LLM fallback ────────────────────────────────────────────────────────

class TestLLMFallback:
    async def test_ambiguous_text_triggers_llm(self):
        """When patterns are ambiguous the detector falls back to LLM."""
        gw = _make_mock_gateway('{"subject": "SCIENCE", "confidence": 0.8}')
        detector = SubjectDetector(gateway=gw)
        # Very short text that won't score highly on any pattern
        result = await detector.detect("Tell me about things.")
        # Should have called the LLM
        assert gw.generate.called
        assert result.subject == "SCIENCE"
        assert result.method == "llm"

    async def test_llm_returns_valid_subject(self):
        gw = _make_mock_gateway('{"subject": "MATH", "confidence": 0.9}')
        detector = SubjectDetector(gateway=gw)
        result = await detector.detect("Ambiguous short text.")
        assert result.subject == "MATH"
        assert result.confidence == 0.9
        assert result.method == "llm"

    async def test_llm_invalid_subject_falls_back_to_other(self):
        gw = _make_mock_gateway('{"subject": "BASKET_WEAVING", "confidence": 0.9}')
        detector = SubjectDetector(gateway=gw)
        result = await detector.detect("Random text here.")
        assert result.subject == "OTHER"

    async def test_llm_json_in_markdown_fences(self):
        gw = _make_mock_gateway('```json\n{"subject": "ELA", "confidence": 0.7}\n```')
        detector = SubjectDetector(gateway=gw)
        result = await detector.detect("Some generic text input.")
        assert result.subject == "ELA"

    async def test_llm_exception_returns_other(self):
        gw = AsyncMock()
        gw.generate.side_effect = RuntimeError("LLM exploded")
        detector = SubjectDetector(gateway=gw)
        result = await detector.detect("Unknown domain text.")
        assert result.subject == "OTHER"
        assert result.confidence == 0.0
        assert result.method == "pattern"


# ── DetectedSubject serialization ────────────────────────────────────────

class TestDetectedSubjectDict:
    def test_to_dict(self):
        ds = DetectedSubject(subject="MATH", confidence=0.85, method="pattern")
        d = ds.to_dict()
        assert d == {"subject": "MATH", "confidence": 0.85, "method": "pattern"}


# ── Valid subjects constant ─────────────────────────────────────────────

class TestConstants:
    def test_valid_subjects_contains_expected(self):
        expected = {"MATH", "ELA", "SCIENCE", "HISTORY", "CODING", "OTHER"}
        assert VALID_SUBJECTS == expected
