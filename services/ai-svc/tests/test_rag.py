"""Tests for RAG knowledge base and retriever."""

from __future__ import annotations

import pytest

from ai_svc.rag.knowledge_base import KnowledgeBase, CURRICULUM_STANDARDS
from ai_svc.rag.retriever import CurriculumRetriever, _grade_to_band


class TestKnowledgeBase:
    def test_seed_data_exists(self):
        assert len(CURRICULUM_STANDARDS) > 10

    def test_search_math(self):
        kb = KnowledgeBase()
        results = kb.search("fractions", subject="MATH")
        assert len(results) > 0
        assert all(r.subject == "MATH" for r in results)

    def test_search_ela(self):
        kb = KnowledgeBase()
        results = kb.search("reading comprehension", subject="ELA")
        assert len(results) > 0

    def test_search_with_grade_band(self):
        kb = KnowledgeBase()
        results = kb.search("counting", subject="MATH", grade_band="K-2")
        assert len(results) > 0
        assert all(r.grade_band == "K-2" for r in results)

    def test_search_science(self):
        kb = KnowledgeBase()
        results = kb.search("investigation", subject="SCIENCE")
        assert len(results) > 0

    def test_search_no_results(self):
        kb = KnowledgeBase()
        results = kb.search("quantum entanglement", subject="MATH", grade_band="K-2")
        assert len(results) == 0

    def test_search_top_k(self):
        kb = KnowledgeBase()
        results = kb.search("math", top_k=3)
        assert len(results) <= 3

    def test_search_domain_match(self):
        kb = KnowledgeBase()
        results = kb.search("algebra", subject="MATH")
        assert len(results) > 0
        assert any(r.domain == "algebra" for r in results)


class TestCurriculumRetriever:
    def test_retrieve_math_k2(self):
        retriever = CurriculumRetriever()
        standards = retriever.retrieve("counting", "MATH", grade=1)
        assert len(standards) > 0
        assert any("Count" in s for s in standards)

    def test_retrieve_ela_35(self):
        retriever = CurriculumRetriever()
        standards = retriever.retrieve("reading comprehension", "ELA", grade=4)
        assert len(standards) > 0

    def test_retrieve_fallback_no_grade(self):
        retriever = CurriculumRetriever()
        standards = retriever.retrieve("algebra", "MATH", grade=7)
        assert len(standards) > 0

    def test_retrieve_returns_formatted_strings(self):
        retriever = CurriculumRetriever()
        standards = retriever.retrieve("counting", "MATH", grade=1)
        for s in standards:
            assert "[CC." in s or "[NGSS." in s
            assert "Grade band:" in s

    def test_grade_to_band(self):
        assert _grade_to_band(1) == "K-2"
        assert _grade_to_band(2) == "K-2"
        assert _grade_to_band(3) == "3-5"
        assert _grade_to_band(5) == "3-5"
        assert _grade_to_band(6) == "6-8"
        assert _grade_to_band(8) == "6-8"
        assert _grade_to_band(9) == "9-12"
        assert _grade_to_band(12) == "9-12"
