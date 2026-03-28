"""Tests for ai_svc.generation.homework_adapter.HomeworkAdapter."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from ai_svc.generation.homework_adapter import (
    HomeworkAdapter,
    AdaptedAssignment,
    AdaptedProblem,
    _ADAPTATION_RULES,
)


# ── Helpers ──────────────────────────────────────────────────────────────

@dataclass
class _FakeLLMResponse:
    content: str
    model: str = "test-model"
    prompt_tokens: int = 100
    completion_tokens: int = 200
    total_tokens: int = 300
    latency_ms: float = 500.0


def _make_valid_response(
    functioning_level: str = "STANDARD",
    num_problems: int = 2,
) -> str:
    """Build a valid JSON adaptation response."""
    problems = []
    for i in range(1, num_problems + 1):
        problems.append({
            "problem_number": i,
            "original": f"Original problem {i}",
            "adapted": f"Adapted problem {i} for {functioning_level}",
            "scaffolding": "Step 1, Step 2",
            "accommodation_notes": "Extended time",
            "visual_supports": ["[PICTURE: visual aid]"],
            "choices": ["A", "B"],
            "parent_guide": "Help the learner with this problem.",
        })
    return json.dumps({
        "original_summary": "Test homework assignment",
        "adapted_problems": problems,
        "parent_guide": "Overall guide for parents.",
        "estimated_minutes": 20,
    })


@dataclass
class _FakeQualityResult:
    passed: bool = True
    content: str = ""
    gates: list = field(default_factory=list)


def _build_adapter(response_content: str) -> HomeworkAdapter:
    """Create an adapter with a mocked gateway and quality gate."""
    gw = AsyncMock()
    gw.generate.return_value = _FakeLLMResponse(content=response_content)

    adapter = HomeworkAdapter.__new__(HomeworkAdapter)
    adapter._gateway = gw
    adapter._assembler = MagicMock()

    quality_mock = MagicMock()
    quality_mock.validate.return_value = _FakeQualityResult(passed=True, content=response_content)
    adapter._quality_gate = quality_mock

    return adapter


# ── Fixtures ─────────────────────────────────────────────────────────────

@pytest.fixture
def sample_problems() -> list[dict[str, Any]]:
    return [
        {
            "number": 1,
            "text": "What is 2+2?",
            "problem_type": "EQUATION",
            "choices": [],
            "equations_latex": ["2+2"],
        },
        {
            "number": 2,
            "text": "Name the capital of France.",
            "problem_type": "SHORT_ANSWER",
            "choices": [],
            "equations_latex": [],
        },
    ]


@pytest.fixture
def sample_brain_context() -> dict[str, Any]:
    return {
        "enrolled_grade": 5,
        "functioning_level": "STANDARD",
        "communication_mode": "VERBAL",
        "active_accommodations": ["extended_time"],
        "iep_goals": ["Improve math fluency"],
    }


# ── _format_problems ────────────────────────────────────────────────────

class TestFormatProblems:
    def test_basic_formatting(self, sample_problems: list[dict]):
        adapter = _build_adapter("")
        result = adapter._format_problems(sample_problems)
        assert "Problem 1" in result
        assert "Problem 2" in result
        assert "EQUATION" in result
        assert "SHORT_ANSWER" in result

    def test_includes_choices(self):
        adapter = _build_adapter("")
        problems = [
            {
                "number": 1,
                "text": "Pick one",
                "problem_type": "MCQ",
                "choices": ["A) Yes", "B) No"],
                "equations_latex": [],
            }
        ]
        result = adapter._format_problems(problems)
        assert "Choices:" in result
        assert "A) Yes" in result

    def test_includes_equations(self):
        adapter = _build_adapter("")
        problems = [
            {
                "number": 1,
                "text": "Solve",
                "problem_type": "EQUATION",
                "choices": [],
                "equations_latex": ["x^2 + 1 = 0"],
            }
        ]
        result = adapter._format_problems(problems)
        assert "Equations:" in result
        assert "x^2 + 1 = 0" in result

    def test_alternate_key_names(self):
        """Supports both 'text'/'problem_text' and 'choices'/'extracted_choices'."""
        adapter = _build_adapter("")
        problems = [
            {
                "problem_number": 3,
                "problem_text": "Alternate key text",
                "type": "MCQ",
                "extracted_choices": ["A) Foo", "B) Bar"],
                "detected_equations_latex": ["e=mc^2"],
            }
        ]
        result = adapter._format_problems(problems)
        assert "Problem 3" in result
        assert "Alternate key text" in result
        assert "A) Foo" in result
        assert "e=mc^2" in result

    def test_empty_problems_list(self):
        adapter = _build_adapter("")
        result = adapter._format_problems([])
        assert result == ""


# ── _parse_response ─────────────────────────────────────────────────────

class TestParseResponse:
    def test_valid_json(self):
        content = _make_valid_response("STANDARD", 2)
        adapter = _build_adapter("")
        result = adapter._parse_response(content, "STANDARD")
        assert isinstance(result, AdaptedAssignment)
        assert result.original_summary == "Test homework assignment"
        assert len(result.adapted_problems) == 2
        assert result.estimated_minutes == 20

    def test_adapted_problem_fields(self):
        content = _make_valid_response("SUPPORTED", 1)
        adapter = _build_adapter("")
        result = adapter._parse_response(content, "SUPPORTED")
        p = result.adapted_problems[0]
        assert p.problem_number == 1
        assert p.original == "Original problem 1"
        assert "SUPPORTED" in p.adapted
        assert p.scaffolding == "Step 1, Step 2"
        assert p.visual_supports == ["[PICTURE: visual aid]"]

    def test_json_in_markdown_code_fences(self):
        raw_json = _make_valid_response("STANDARD", 1)
        fenced = f"```json\n{raw_json}\n```"
        adapter = _build_adapter("")
        result = adapter._parse_response(fenced, "STANDARD")
        assert len(result.adapted_problems) == 1

    def test_invalid_json_returns_empty_assignment(self):
        adapter = _build_adapter("")
        result = adapter._parse_response("This is not JSON at all!", "STANDARD")
        assert isinstance(result, AdaptedAssignment)
        assert result.original_summary == "Failed to parse adaptation"
        assert result.adapted_problems == []

    def test_partial_json_missing_fields(self):
        content = json.dumps({"original_summary": "Partial", "adapted_problems": []})
        adapter = _build_adapter("")
        result = adapter._parse_response(content, "STANDARD")
        assert result.original_summary == "Partial"
        assert result.adapted_problems == []
        assert result.estimated_minutes == 15  # default


# ── Full adapt() with mocked dependencies ───────────────────────────────

class TestAdapt:
    async def test_adapt_returns_adapted_assignment(
        self,
        sample_problems: list[dict],
        sample_brain_context: dict,
    ):
        response_content = _make_valid_response("STANDARD", 2)
        adapter = _build_adapter(response_content)
        result = await adapter.adapt(
            extracted_problems=sample_problems,
            brain_context=sample_brain_context,
            subject="MATH",
        )
        assert isinstance(result, AdaptedAssignment)
        assert result.functioning_level == "STANDARD"
        assert result.model == "test-model"
        assert result.quality_passed is True
        assert len(result.adapted_problems) == 2

    async def test_adapt_calls_gateway_generate(
        self,
        sample_problems: list[dict],
        sample_brain_context: dict,
    ):
        response_content = _make_valid_response("STANDARD", 2)
        adapter = _build_adapter(response_content)
        await adapter.adapt(
            extracted_problems=sample_problems,
            brain_context=sample_brain_context,
            subject="MATH",
        )
        adapter._gateway.generate.assert_called_once()

    async def test_adapt_quality_gate_failure(
        self,
        sample_problems: list[dict],
        sample_brain_context: dict,
    ):
        response_content = _make_valid_response("STANDARD", 1)
        adapter = _build_adapter(response_content)

        failed_gate = MagicMock()
        failed_gate.passed = False
        failed_gate.details = "Content too complex"
        quality_result = _FakeQualityResult(passed=False, content="", gates=[failed_gate])
        adapter._quality_gate.validate.return_value = quality_result

        result = await adapter.adapt(
            extracted_problems=sample_problems,
            brain_context=sample_brain_context,
            subject="MATH",
        )
        assert result.quality_passed is False


# ── Functioning level coverage ──────────────────────────────────────────

class TestFunctioningLevels:
    @pytest.mark.parametrize("level", ["STANDARD", "SUPPORTED", "LOW_VERBAL", "NON_VERBAL", "PRE_SYMBOLIC"])
    async def test_adapt_for_each_functioning_level(self, level: str, sample_problems: list[dict]):
        brain = {
            "enrolled_grade": 3,
            "functioning_level": level,
            "communication_mode": "VERBAL",
            "active_accommodations": ["extended_time"],
            "iep_goals": [],
        }
        response_content = _make_valid_response(level, 2)
        adapter = _build_adapter(response_content)
        result = await adapter.adapt(
            extracted_problems=sample_problems,
            brain_context=brain,
            subject="MATH",
        )
        assert result.functioning_level == level
        assert len(result.adapted_problems) == 2

    def test_adaptation_rules_exist_for_all_levels(self):
        expected = {"STANDARD", "SUPPORTED", "LOW_VERBAL", "NON_VERBAL", "PRE_SYMBOLIC"}
        assert set(_ADAPTATION_RULES.keys()) == expected


# ── Dataclass serialization ─────────────────────────────────────────────

class TestSerialization:
    def test_adapted_problem_to_dict(self):
        p = AdaptedProblem(
            problem_number=1,
            original="What is 2+2?",
            adapted="Add 2 and 2.",
            scaffolding="Count on fingers",
            accommodation_notes="Extended time",
            visual_supports=["[PICTURE: fingers]"],
            choices=["3", "4"],
            parent_guide="Help count.",
        )
        d = p.to_dict()
        assert d["problem_number"] == 1
        assert d["original"] == "What is 2+2?"
        assert d["visual_supports"] == ["[PICTURE: fingers]"]

    def test_adapted_assignment_to_dict(self):
        assignment = AdaptedAssignment(
            original_summary="Test",
            adapted_problems=[
                AdaptedProblem(problem_number=1, original="A", adapted="B"),
            ],
            parent_guide="Guide",
            estimated_minutes=10,
            functioning_level="STANDARD",
            quality_passed=True,
            model="gpt-4",
        )
        d = assignment.to_dict()
        assert d["original_summary"] == "Test"
        assert len(d["adapted_problems"]) == 1
        assert d["model"] == "gpt-4"
