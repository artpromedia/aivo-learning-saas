"""Tests for ai_svc.vision.ocr_processor.OCRProcessor."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest

from ai_svc.vision.ocr_processor import (
    OCRProcessor,
    ExtractedDocument,
    ExtractedProblem,
)


# ── Helpers ──────────────────────────────────────────────────────────────

@dataclass
class _FakeLLMResponse:
    content: str
    model: str = "test-model"
    prompt_tokens: int = 50
    completion_tokens: int = 100
    total_tokens: int = 150
    latency_ms: float = 300.0


def _make_mock_gateway(vision_content: str = "{}"):
    gw = AsyncMock()
    gw.generate_with_vision.return_value = _FakeLLMResponse(content=vision_content)
    # Also mock generate for subject detection LLM fallback
    gw.generate.return_value = _FakeLLMResponse(
        content='{"subject": "MATH", "confidence": 0.9}'
    )
    return gw


def _make_processor(vision_content: str = "{}") -> OCRProcessor:
    """Create an OCRProcessor with mocked gateway."""
    gw = _make_mock_gateway(vision_content)
    return OCRProcessor(gateway=gw)


def _valid_vision_json(
    printed_text: str = "Solve 2+2",
    num_problems: int = 1,
) -> str:
    problems = []
    for i in range(1, num_problems + 1):
        problems.append({
            "number": i,
            "text": f"Problem {i}: {printed_text}",
            "type": "EQUATION",
            "choices": [],
            "equations_latex": ["2+2"],
            "student_answer": None,
        })
    return json.dumps({
        "printed_text": printed_text,
        "handwritten_text": "student notes",
        "math_equations": ["2+2"],
        "tables": [],
        "diagrams": ["A number line"],
        "problems": problems,
    })


# ── Fixtures ─────────────────────────────────────────────────────────────

@pytest.fixture
def processor() -> OCRProcessor:
    return _make_processor(_valid_vision_json())


# ── _parse_vision_response ──────────────────────────────────────────────

class TestParseVisionResponse:
    def test_valid_json_response(self):
        proc = _make_processor()
        response_json = _valid_vision_json("Solve x + 1 = 5", num_problems=2)
        doc = proc._parse_vision_response(response_json)
        assert isinstance(doc, ExtractedDocument)
        assert doc.raw_text == "Solve x + 1 = 5"
        assert doc.handwritten_text == "student notes"
        assert doc.math_equations == ["2+2"]
        assert len(doc.problems) == 2
        assert doc.problems[0].problem_type == "EQUATION"
        assert doc.diagrams == ["A number line"]

    def test_json_in_markdown_code_fences(self):
        proc = _make_processor()
        inner = _valid_vision_json("Fenced content", num_problems=1)
        fenced = f"```json\n{inner}\n```"
        doc = proc._parse_vision_response(fenced)
        assert doc.raw_text == "Fenced content"
        assert len(doc.problems) == 1

    def test_json_in_plain_code_fences(self):
        proc = _make_processor()
        inner = _valid_vision_json("Plain fence", num_problems=1)
        fenced = f"```\n{inner}\n```"
        doc = proc._parse_vision_response(fenced)
        assert doc.raw_text == "Plain fence"

    def test_invalid_json_falls_back_to_raw_text(self):
        proc = _make_processor()
        raw = "This is not JSON, just plain text from the model."
        doc = proc._parse_vision_response(raw)
        assert doc.raw_text == raw
        assert doc.problems == []
        assert doc.math_equations == []

    def test_partial_json_missing_optional_fields(self):
        proc = _make_processor()
        minimal = json.dumps({"printed_text": "Hello", "problems": []})
        doc = proc._parse_vision_response(minimal)
        assert doc.raw_text == "Hello"
        assert doc.handwritten_text == ""
        assert doc.problems == []
        assert doc.tables == []
        assert doc.diagrams == []

    def test_problem_fields_parsed_correctly(self):
        proc = _make_processor()
        data = json.dumps({
            "printed_text": "test",
            "handwritten_text": "",
            "math_equations": [],
            "tables": [],
            "diagrams": [],
            "problems": [
                {
                    "number": 1,
                    "text": "What is 5 + 3?",
                    "type": "EQUATION",
                    "choices": [],
                    "equations_latex": ["5 + 3"],
                    "student_answer": "8",
                }
            ],
        })
        doc = proc._parse_vision_response(data)
        p = doc.problems[0]
        assert p.number == 1
        assert p.problem_text == "What is 5 + 3?"
        assert p.problem_type == "EQUATION"
        assert p.student_answer == "8"
        assert p.detected_equations_latex == ["5 + 3"]

    def test_mcq_problem_with_choices(self):
        proc = _make_processor()
        data = json.dumps({
            "printed_text": "Quiz",
            "problems": [
                {
                    "number": 1,
                    "text": "What color is the sky?",
                    "type": "MCQ",
                    "choices": ["A) Red", "B) Blue", "C) Green", "D) Yellow"],
                    "equations_latex": [],
                    "student_answer": None,
                }
            ],
        })
        doc = proc._parse_vision_response(data)
        p = doc.problems[0]
        assert p.problem_type == "MCQ"
        assert len(p.extracted_choices) == 4


# ── _build_combined_text ────────────────────────────────────────────────

class TestBuildCombinedText:
    def test_combines_all_text_parts(self):
        proc = _make_processor()
        doc = ExtractedDocument(
            raw_text="Printed stuff",
            handwritten_text="Handwritten notes",
            math_equations=["x^2", "y=3"],
            problems=[
                ExtractedProblem(
                    number=1,
                    problem_text="Solve for x",
                    problem_type="EQUATION",
                ),
                ExtractedProblem(
                    number=2,
                    problem_text="Name the capital",
                    problem_type="SHORT_ANSWER",
                ),
            ],
        )
        combined = proc._build_combined_text(doc)
        assert "Printed stuff" in combined
        assert "Handwritten notes" in combined
        assert "Solve for x" in combined
        assert "Name the capital" in combined
        assert "x^2" in combined
        assert "y=3" in combined

    def test_skips_empty_parts(self):
        proc = _make_processor()
        doc = ExtractedDocument(
            raw_text="Only printed",
            handwritten_text="",
            math_equations=[],
            problems=[],
        )
        combined = proc._build_combined_text(doc)
        assert combined == "Only printed"
        # Empty strings should not create extra newlines
        assert "\n\n" not in combined

    def test_empty_document(self):
        proc = _make_processor()
        doc = ExtractedDocument()
        combined = proc._build_combined_text(doc)
        assert combined == ""


# ── ExtractedProblem serialization ───────────────────────────────────────

class TestExtractedProblemDict:
    def test_to_dict(self):
        p = ExtractedProblem(
            number=1,
            problem_text="What is 2+2?",
            problem_type="EQUATION",
            extracted_choices=[],
            detected_equations_latex=["2+2"],
            student_answer="4",
        )
        d = p.to_dict()
        assert d["number"] == 1
        assert d["problem_text"] == "What is 2+2?"
        assert d["student_answer"] == "4"


class TestExtractedDocumentDict:
    def test_to_dict_without_subject(self):
        doc = ExtractedDocument(raw_text="hello", problems=[])
        d = doc.to_dict()
        assert d["raw_text"] == "hello"
        assert d["detected_subject"] is None

    def test_to_dict_with_subject(self):
        from ai_svc.vision.subject_detector import DetectedSubject

        doc = ExtractedDocument(
            raw_text="math stuff",
            detected_subject=DetectedSubject(subject="MATH", confidence=0.9, method="pattern"),
            problems=[],
        )
        d = doc.to_dict()
        assert d["detected_subject"]["subject"] == "MATH"


# ── Full extract() integration (mocked) ─────────────────────────────────

class TestExtract:
    async def test_extract_from_image_bytes(self):
        vision_json = _valid_vision_json("Solve 1+1", num_problems=1)
        gw = _make_mock_gateway(vision_json)
        proc = OCRProcessor(gateway=gw)
        doc = await proc.extract(image_bytes=b"fake-image-data")
        assert isinstance(doc, ExtractedDocument)
        assert len(doc.problems) >= 1
        assert doc.detected_subject is not None
        gw.generate_with_vision.assert_called_once()

    async def test_extract_from_image_url(self):
        vision_json = _valid_vision_json("Solve 3+3", num_problems=1)
        gw = _make_mock_gateway(vision_json)
        proc = OCRProcessor(gateway=gw)
        doc = await proc.extract(image_url="https://example.com/hw.jpg")
        assert isinstance(doc, ExtractedDocument)
        gw.generate_with_vision.assert_called_once()

    async def test_extract_no_input_raises(self):
        proc = _make_processor()
        with pytest.raises(ValueError, match="required"):
            await proc.extract()

    async def test_extract_falls_back_to_parser_when_no_problems(self):
        """When vision returns text but no problems, ProblemParser is used."""
        response = json.dumps({
            "printed_text": "1) What is 2+2?\n2) What is 3+3?",
            "handwritten_text": "",
            "math_equations": [],
            "tables": [],
            "diagrams": [],
            "problems": [],
        })
        gw = _make_mock_gateway(response)
        proc = OCRProcessor(gateway=gw)
        doc = await proc.extract(image_bytes=b"fake")
        # ProblemParser should have split the numbered text into 2 problems
        assert len(doc.problems) == 2
