"""Tests for Vision AI OCR and extraction."""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock

import pytest

from ai_svc.vision.ocr_processor import OCRProcessor, HomeworkExtraction
from ai_svc.vision.handwriting import recognize_handwriting
from ai_svc.vision.math_extractor import extract_math_equations


class TestHomeworkExtraction:
    def test_to_dict(self):
        ext = HomeworkExtraction(
            printed_text="Hello",
            math_equations=["x+1=2"],
            subject="MATH",
            problems=[{"number": 1, "text": "Solve x+1=2"}],
        )
        d = ext.to_dict()
        assert d["printed_text"] == "Hello"
        assert d["subject"] == "MATH"
        assert len(d["problems"]) == 1


class TestOCRProcessor:
    @pytest.mark.asyncio
    async def test_process_image(self):
        mock_gateway = AsyncMock()
        mock_gateway.generate_with_vision = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "printed_text": "Solve: 3 + 4 = ?",
                "handwritten_text": "7",
                "math_equations": ["3 + 4 = 7"],
                "tables": [],
                "diagrams": [],
                "subject": "MATH",
                "problems": [{"number": 1, "text": "3 + 4 = ?", "student_answer": "7", "type": "equation"}],
            })
        ))

        processor = OCRProcessor(mock_gateway)
        result = await processor.process_image(image_url="https://example.com/hw.jpg")
        assert result.subject == "MATH"
        assert len(result.problems) == 1
        assert result.handwritten_text == "7"

    @pytest.mark.asyncio
    async def test_process_image_invalid_json(self):
        mock_gateway = AsyncMock()
        mock_gateway.generate_with_vision = AsyncMock(return_value=MagicMock(
            content="This is not JSON"
        ))

        processor = OCRProcessor(mock_gateway)
        result = await processor.process_image(image_url="https://example.com/hw.jpg")
        assert result.printed_text == "This is not JSON"

    @pytest.mark.asyncio
    async def test_process_pdf(self):
        import io
        from pypdf import PdfWriter

        writer = PdfWriter()
        writer.add_blank_page(width=200, height=200)
        buf = io.BytesIO()
        writer.write(buf)
        pdf_bytes = buf.getvalue()

        mock_gateway = AsyncMock()
        processor = OCRProcessor(mock_gateway)
        result = await processor.process_pdf(pdf_bytes)
        assert isinstance(result, HomeworkExtraction)

    def test_detect_subject_math(self):
        processor = OCRProcessor(MagicMock())
        assert processor._detect_subject("Solve the equation x = 5") == "MATH"

    def test_detect_subject_ela(self):
        processor = OCRProcessor(MagicMock())
        assert processor._detect_subject("Read the paragraph and write your answer") == "ELA"

    def test_detect_subject_science(self):
        processor = OCRProcessor(MagicMock())
        assert processor._detect_subject("Describe the hypothesis of the experiment") == "SCIENCE"

    def test_detect_subject_history(self):
        processor = OCRProcessor(MagicMock())
        assert processor._detect_subject("The history of the war between nations") == "HISTORY"

    def test_detect_subject_other(self):
        processor = OCRProcessor(MagicMock())
        assert processor._detect_subject("Just some random text") == "OTHER"


class TestHandwriting:
    @pytest.mark.asyncio
    async def test_recognize(self):
        mock_gateway = AsyncMock()
        mock_gateway.generate_with_vision = AsyncMock(return_value=MagicMock(
            content="Hello World\n42 + 3 = 45"
        ))
        result = await recognize_handwriting(mock_gateway, image_url="https://example.com/hw.jpg")
        assert "Hello World" in result


class TestMathExtractor:
    @pytest.mark.asyncio
    async def test_extract(self):
        mock_gateway = AsyncMock()
        mock_gateway.generate_with_vision = AsyncMock(return_value=MagicMock(
            content='["x^2 + 2x + 1 = 0", "\\\\frac{3}{4}"]'
        ))
        result = await extract_math_equations(mock_gateway, image_url="https://example.com/math.jpg")
        assert len(result) == 2
        assert "x^2" in result[0]

    @pytest.mark.asyncio
    async def test_extract_invalid_json(self):
        mock_gateway = AsyncMock()
        mock_gateway.generate_with_vision = AsyncMock(return_value=MagicMock(
            content="x^2 + 1 = 0"
        ))
        result = await extract_math_equations(mock_gateway, image_url="https://example.com/math.jpg")
        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_extract_empty(self):
        mock_gateway = AsyncMock()
        mock_gateway.generate_with_vision = AsyncMock(return_value=MagicMock(content=""))
        result = await extract_math_equations(mock_gateway, image_url="https://example.com/empty.jpg")
        assert result == []
