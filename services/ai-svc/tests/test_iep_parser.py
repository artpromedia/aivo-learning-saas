"""Tests for IEP document parser."""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from ai_svc.iep.parser import IEPParser
from ai_svc.iep.extractor import IEPExtraction, Accommodation, IEPGoal


class TestIEPExtraction:
    def test_to_dict(self):
        extraction = IEPExtraction(
            disability_categories=["Autism"],
            accommodations=[Accommodation(name="Extended time", description="1.5x", category="testing")],
            goals=[IEPGoal(goal_text="Read at grade level", domain="ELA", target_metric="reading level")],
            grade_level=3,
            communication_system="verbal",
            assistive_technology=["tablet"],
            recommended_functioning_level="SUPPORTED",
        )
        d = extraction.to_dict()
        assert d["disability_categories"] == ["Autism"]
        assert len(d["accommodations"]) == 1
        assert d["accommodations"][0]["name"] == "Extended time"
        assert len(d["goals"]) == 1
        assert d["grade_level"] == 3

    def test_empty_extraction(self):
        extraction = IEPExtraction()
        d = extraction.to_dict()
        assert d["disability_categories"] == []
        assert d["goals"] == []


class TestIEPParser:
    @pytest.mark.asyncio
    async def test_parse_text(self):
        mock_gateway = AsyncMock()
        mock_gateway.generate = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "disability_categories": ["Autism Spectrum Disorder"],
                "accommodations": [{"name": "Extended time", "description": "1.5x", "category": "testing"}],
                "goals": [{"goal_text": "Read at grade 3", "domain": "ELA", "target_metric": "FK level", "target_value": "3.0", "timeline": "1 year"}],
                "grade_level": 3,
                "communication_system": "verbal",
                "assistive_technology": ["iPad"],
                "recommended_functioning_level": "SUPPORTED",
            })
        ))

        parser = IEPParser(mock_gateway)
        result = await parser.parse_text("Student has Autism Spectrum Disorder...")
        assert "Autism Spectrum Disorder" in result.disability_categories
        assert len(result.accommodations) == 1
        assert len(result.goals) == 1
        assert result.grade_level == 3

    @pytest.mark.asyncio
    async def test_parse_text_invalid_json(self):
        mock_gateway = AsyncMock()
        mock_gateway.generate = AsyncMock(return_value=MagicMock(content="not json at all"))

        parser = IEPParser(mock_gateway)
        result = await parser.parse_text("Some IEP text")
        assert result.disability_categories == []
        assert result.raw_text == "Some IEP text"

    @pytest.mark.asyncio
    async def test_parse_text_markdown_json(self):
        json_content = json.dumps({
            "disability_categories": ["ADHD"],
            "accommodations": [],
            "goals": [],
            "grade_level": 5,
            "communication_system": None,
            "assistive_technology": [],
            "recommended_functioning_level": None,
        })
        mock_gateway = AsyncMock()
        mock_gateway.generate = AsyncMock(return_value=MagicMock(
            content=f"```json\n{json_content}\n```"
        ))

        parser = IEPParser(mock_gateway)
        result = await parser.parse_text("IEP text for ADHD student")
        assert "ADHD" in result.disability_categories

    @pytest.mark.asyncio
    async def test_parse_pdf(self):
        # Create a minimal PDF
        import io
        from pypdf import PdfWriter

        writer = PdfWriter()
        writer.add_blank_page(width=200, height=200)
        buf = io.BytesIO()
        writer.write(buf)
        pdf_bytes = buf.getvalue()

        mock_gateway = AsyncMock()
        mock_gateway.generate = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "disability_categories": [],
                "accommodations": [],
                "goals": [],
                "grade_level": None,
                "communication_system": None,
                "assistive_technology": [],
                "recommended_functioning_level": None,
            })
        ))

        parser = IEPParser(mock_gateway)
        # Empty PDF has no text, so returns empty extraction
        result = await parser.parse_pdf(pdf_bytes)
        assert result.raw_text == ""

    @pytest.mark.asyncio
    async def test_parse_image(self):
        mock_gateway = AsyncMock()
        # Vision call returns OCR text
        mock_gateway.generate_with_vision = AsyncMock(return_value=MagicMock(
            content="Student Name: John. Disability: Autism."
        ))
        # Text parsing returns structured data
        mock_gateway.generate = AsyncMock(return_value=MagicMock(
            content=json.dumps({
                "disability_categories": ["Autism"],
                "accommodations": [],
                "goals": [],
                "grade_level": None,
                "communication_system": None,
                "assistive_technology": [],
                "recommended_functioning_level": None,
            })
        ))

        parser = IEPParser(mock_gateway)
        result = await parser.parse_image("https://example.com/iep.jpg")
        assert "Autism" in result.disability_categories

    @pytest.mark.asyncio
    async def test_parse_image_empty_ocr(self):
        mock_gateway = AsyncMock()
        mock_gateway.generate_with_vision = AsyncMock(return_value=MagicMock(content=""))

        parser = IEPParser(mock_gateway)
        result = await parser.parse_image("https://example.com/blank.jpg")
        assert result.disability_categories == []
