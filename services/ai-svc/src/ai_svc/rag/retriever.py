"""Semantic search over curriculum standards."""

from __future__ import annotations

import logging
from typing import Any

from ai_svc.rag.knowledge_base import KnowledgeBase, StandardMatch

logger = logging.getLogger(__name__)


def _grade_to_band(grade: int) -> str:
    if grade <= 2:
        return "K-2"
    if grade <= 5:
        return "3-5"
    if grade <= 8:
        return "6-8"
    return "9-12"


class CurriculumRetriever:
    """Retrieves relevant curriculum standards for content generation."""

    def __init__(self, knowledge_base: KnowledgeBase | None = None) -> None:
        self._kb = knowledge_base or KnowledgeBase()

    def retrieve(
        self,
        skill: str,
        subject: str,
        grade: int,
        top_k: int = 5,
    ) -> list[str]:
        """Retrieve top-k relevant curriculum standards as text.

        Returns list of standard descriptions for injection into prompts.
        """
        grade_band = _grade_to_band(grade)
        matches = self._kb.search(
            query=skill,
            subject=subject,
            grade_band=grade_band,
            top_k=top_k,
        )

        if not matches:
            # Fallback: search without grade filter
            matches = self._kb.search(query=skill, subject=subject, top_k=top_k)

        return [
            f"[{m.id}] {m.standard} (Grade band: {m.grade_band})"
            for m in matches
        ]
