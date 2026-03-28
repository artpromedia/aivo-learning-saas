"""Tests for CurriculumRetriever with in-memory fallback and grade band mapping."""

from __future__ import annotations

import pytest
import pytest_asyncio

from ai_svc.rag.knowledge_base import KnowledgeBase, CURRICULUM_STANDARDS
from ai_svc.rag.retriever import CurriculumRetriever, _grade_to_band


class TestGradeToBand:
    def test_kindergarten(self):
        assert _grade_to_band(0) == "K-2"

    def test_grade_1(self):
        assert _grade_to_band(1) == "K-2"

    def test_grade_2(self):
        assert _grade_to_band(2) == "K-2"

    def test_grade_3(self):
        assert _grade_to_band(3) == "3-5"

    def test_grade_4(self):
        assert _grade_to_band(4) == "3-5"

    def test_grade_5(self):
        assert _grade_to_band(5) == "3-5"

    def test_grade_6(self):
        assert _grade_to_band(6) == "6-8"

    def test_grade_8(self):
        assert _grade_to_band(8) == "6-8"

    def test_grade_9(self):
        assert _grade_to_band(9) == "9-12"

    def test_grade_12(self):
        assert _grade_to_band(12) == "9-12"


class TestCurriculumRetrieverInMemory:
    """Test retriever with in-memory keyword fallback (no db session)."""

    @pytest.mark.asyncio
    async def test_retrieve_math_k2(self):
        retriever = CurriculumRetriever()
        standards = await retriever.retrieve("counting", "MATH", grade=1)
        assert len(standards) > 0
        assert any("Count" in s for s in standards)

    @pytest.mark.asyncio
    async def test_retrieve_ela_35(self):
        retriever = CurriculumRetriever()
        standards = await retriever.retrieve("reading comprehension", "ELA", grade=4)
        assert len(standards) > 0

    @pytest.mark.asyncio
    async def test_retrieve_science_k2(self):
        retriever = CurriculumRetriever()
        standards = await retriever.retrieve("investigation", "SCIENCE", grade=1)
        assert len(standards) > 0

    @pytest.mark.asyncio
    async def test_retrieve_returns_formatted_strings(self):
        retriever = CurriculumRetriever()
        standards = await retriever.retrieve("counting", "MATH", grade=1)
        for s in standards:
            assert "[CC." in s or "[NGSS." in s
            assert "Grade band:" in s

    @pytest.mark.asyncio
    async def test_retrieve_respects_top_k(self):
        retriever = CurriculumRetriever()
        standards = await retriever.retrieve("math", "MATH", grade=3, top_k=2)
        assert len(standards) <= 2

    @pytest.mark.asyncio
    async def test_retrieve_grade_band_mapping_k2(self):
        """Grade 1 should map to K-2 band and find K-2 standards."""
        retriever = CurriculumRetriever()
        standards = await retriever.retrieve("counting", "MATH", grade=1)
        assert any("K-2" in s for s in standards)

    @pytest.mark.asyncio
    async def test_retrieve_grade_band_mapping_35(self):
        """Grade 4 should map to 3-5 band."""
        retriever = CurriculumRetriever()
        standards = await retriever.retrieve("fractions", "MATH", grade=4)
        assert any("3-5" in s for s in standards)

    @pytest.mark.asyncio
    async def test_retrieve_grade_band_mapping_68(self):
        """Grade 7 should map to 6-8 band."""
        retriever = CurriculumRetriever()
        standards = await retriever.retrieve("algebra", "MATH", grade=7)
        assert any("6-8" in s for s in standards)

    @pytest.mark.asyncio
    async def test_retrieve_empty_results_fallback(self):
        """When no results match with grade filter, should try without grade."""
        retriever = CurriculumRetriever()
        # Use a very specific query that might not match the narrow grade band
        # The fallback without grade filter should still try to find something
        standards = await retriever.retrieve("algebra", "MATH", grade=1)
        # algebra is only in 6-8, so K-2 won't match,
        # but fallback (no grade_band filter) should find it
        assert len(standards) > 0

    @pytest.mark.asyncio
    async def test_retrieve_no_results_obscure_query(self):
        """Truly unrelated queries may return empty."""
        retriever = CurriculumRetriever()
        standards = await retriever.retrieve(
            "quantum entanglement", "MATH", grade=1
        )
        # May or may not find results depending on keyword overlap
        assert isinstance(standards, list)

    @pytest.mark.asyncio
    async def test_retrieve_custom_knowledge_base(self):
        """Should accept a custom KnowledgeBase instance."""
        kb = KnowledgeBase()
        retriever = CurriculumRetriever(knowledge_base=kb)
        standards = await retriever.retrieve("counting", "MATH", grade=1)
        assert len(standards) > 0
