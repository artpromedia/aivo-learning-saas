"""Semantic search over curriculum standards."""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

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

    async def retrieve(
        self,
        skill: str,
        subject: str,
        grade: int,
        top_k: int = 5,
        session: AsyncSession | None = None,
    ) -> list[str]:
        """Retrieve top-k relevant curriculum standards as text.

        When *session* is provided, embeds the query and performs pgvector
        cosine-similarity search.  Otherwise falls back to keyword search.

        Returns list of standard descriptions for injection into prompts.
        """
        grade_band = _grade_to_band(grade)

        query_embedding: list[float] | None = None
        if session is not None:
            try:
                from ai_svc.rag.embedder import embed_text
                query_embedding = await embed_text(skill)
            except Exception:
                logger.warning("Failed to embed query — falling back to keyword search", exc_info=True)
                session = None  # fall through to keyword path

        matches = await self._kb.search(
            query=skill,
            subject=subject,
            grade_band=grade_band,
            top_k=top_k,
            session=session,
            query_embedding=query_embedding,
        )

        if not matches:
            # Fallback: search without grade filter
            matches = await self._kb.search(
                query=skill,
                subject=subject,
                top_k=top_k,
                session=session,
                query_embedding=query_embedding,
            )

        return [
            f"[{m.id}] {m.standard} (Grade band: {m.grade_band})"
            for m in matches
        ]
