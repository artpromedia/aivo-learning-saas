"""Curriculum knowledge base backed by pgvector with keyword fallback."""

from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, DateTime, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# SQLAlchemy model
# ---------------------------------------------------------------------------

class _Base(DeclarativeBase):
    pass


class Embedding(_Base):
    """pgvector-backed embedding row."""

    __tablename__ = "embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    collection = Column(String(128), nullable=False, index=True)
    content = Column(Text, nullable=False)
    metadata_ = Column("metadata", JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    embedding = Column(Vector(1536), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


# ---------------------------------------------------------------------------
# Seed curriculum standards (in-memory fallback)
# ---------------------------------------------------------------------------

CURRICULUM_STANDARDS: list[dict[str, str]] = [
    # Common Core Math K-2
    {"id": "CC.MATH.K.1", "subject": "MATH", "grade_band": "K-2", "standard": "Count to 100 by ones and by tens", "domain": "counting"},
    {"id": "CC.MATH.K.2", "subject": "MATH", "grade_band": "K-2", "standard": "Compare two numbers between 1 and 10 presented as written numerals", "domain": "counting"},
    {"id": "CC.MATH.1.1", "subject": "MATH", "grade_band": "K-2", "standard": "Add and subtract within 20", "domain": "operations"},
    {"id": "CC.MATH.2.1", "subject": "MATH", "grade_band": "K-2", "standard": "Fluently add and subtract within 100", "domain": "operations"},
    # Common Core Math 3-5
    {"id": "CC.MATH.3.1", "subject": "MATH", "grade_band": "3-5", "standard": "Multiply and divide within 100", "domain": "multiplication"},
    {"id": "CC.MATH.4.1", "subject": "MATH", "grade_band": "3-5", "standard": "Use the four operations with whole numbers to solve problems", "domain": "operations"},
    {"id": "CC.MATH.5.1", "subject": "MATH", "grade_band": "3-5", "standard": "Add and subtract fractions with unlike denominators", "domain": "fractions"},
    # Common Core Math 6-8
    {"id": "CC.MATH.6.1", "subject": "MATH", "grade_band": "6-8", "standard": "Understand ratio concepts and use ratio reasoning", "domain": "algebra"},
    {"id": "CC.MATH.7.1", "subject": "MATH", "grade_band": "6-8", "standard": "Apply proportional relationships", "domain": "algebra"},
    {"id": "CC.MATH.8.1", "subject": "MATH", "grade_band": "6-8", "standard": "Define, evaluate, and compare functions", "domain": "algebra"},
    # Common Core ELA K-2
    {"id": "CC.ELA.K.1", "subject": "ELA", "grade_band": "K-2", "standard": "Demonstrate understanding of the organization and basic features of print", "domain": "phonics"},
    {"id": "CC.ELA.1.1", "subject": "ELA", "grade_band": "K-2", "standard": "Know and apply grade-level phonics and word analysis skills", "domain": "phonics"},
    {"id": "CC.ELA.2.1", "subject": "ELA", "grade_band": "K-2", "standard": "Read with sufficient accuracy and fluency to support comprehension", "domain": "reading_comprehension"},
    # Common Core ELA 3-5
    {"id": "CC.ELA.3.1", "subject": "ELA", "grade_band": "3-5", "standard": "Determine the main idea of a text; recount the key details", "domain": "reading_comprehension"},
    {"id": "CC.ELA.4.1", "subject": "ELA", "grade_band": "3-5", "standard": "Determine the meaning of general academic and domain-specific words", "domain": "reading_comprehension"},
    {"id": "CC.ELA.5.1", "subject": "ELA", "grade_band": "3-5", "standard": "Write opinion pieces on topics, supporting a point of view with reasons", "domain": "essay_writing"},
    # Common Core ELA 6-8
    {"id": "CC.ELA.6.1", "subject": "ELA", "grade_band": "6-8", "standard": "Cite textual evidence to support analysis of what the text says", "domain": "essay_writing"},
    {"id": "CC.ELA.7.1", "subject": "ELA", "grade_band": "6-8", "standard": "Write arguments to support claims with relevant evidence and reasoning", "domain": "essay_writing"},
    # NGSS Science K-2
    {"id": "NGSS.K.PS2", "subject": "SCIENCE", "grade_band": "K-2", "standard": "Plan and conduct an investigation to compare the effects of different strengths of pushes and pulls", "domain": "basic_science"},
    {"id": "NGSS.1.LS1", "subject": "SCIENCE", "grade_band": "K-2", "standard": "Use observations to describe patterns of what plants and animals need to survive", "domain": "basic_science"},
    # NGSS Science 3-5
    {"id": "NGSS.3.LS1", "subject": "SCIENCE", "grade_band": "3-5", "standard": "Develop models to describe that organisms have unique and diverse life cycles", "domain": "basic_science"},
    {"id": "NGSS.4.PS3", "subject": "SCIENCE", "grade_band": "3-5", "standard": "Apply scientific ideas to design, test, and refine a device that converts energy", "domain": "basic_science"},
    # NGSS Science 6-8
    {"id": "NGSS.MS.PS1", "subject": "SCIENCE", "grade_band": "6-8", "standard": "Develop models to describe the atomic composition of simple molecules", "domain": "scientific_method"},
    {"id": "NGSS.MS.LS2", "subject": "SCIENCE", "grade_band": "6-8", "standard": "Analyze and interpret data to provide evidence for the effects of resource availability", "domain": "scientific_method"},
]


@dataclass
class StandardMatch:
    """A matched curriculum standard."""
    id: str
    standard: str
    subject: str
    grade_band: str
    domain: str
    score: float = 1.0


class KnowledgeBase:
    """Curriculum knowledge base with pgvector cosine-similarity search
    and in-memory keyword fallback.

    When an async database session is provided, ``search`` performs a real
    cosine-similarity query against the ``embeddings`` table.  Without a
    session it falls back to the keyword-overlap approach using the
    ``CURRICULUM_STANDARDS`` seed data.
    """

    def __init__(self) -> None:
        self._standards = CURRICULUM_STANDARDS

    # ------------------------------------------------------------------
    # pgvector search
    # ------------------------------------------------------------------

    async def search(
        self,
        query: str,
        subject: str | None = None,
        grade_band: str | None = None,
        top_k: int = 5,
        session: AsyncSession | None = None,
        query_embedding: list[float] | None = None,
    ) -> list[StandardMatch]:
        """Search for relevant curriculum standards.

        If *session* and *query_embedding* are provided, uses pgvector
        cosine-similarity search.  Otherwise falls back to keyword search.
        """
        if session is not None and query_embedding is not None:
            return await self._vector_search(
                session=session,
                query_embedding=query_embedding,
                subject=subject,
                grade_band=grade_band,
                top_k=top_k,
            )
        return self._keyword_search(query, subject, grade_band, top_k)

    async def _vector_search(
        self,
        session: AsyncSession,
        query_embedding: list[float],
        subject: str | None,
        grade_band: str | None,
        top_k: int,
    ) -> list[StandardMatch]:
        """Cosine-similarity search via pgvector."""
        from sqlalchemy import select, func

        distance = Embedding.embedding.cosine_distance(query_embedding).label("distance")
        stmt = (
            select(Embedding, distance)
            .where(Embedding.collection == "curriculum_standards")
            .order_by(distance)
            .limit(top_k)
        )

        if subject:
            stmt = stmt.where(
                Embedding.metadata_["subject"].astext == subject.upper()
            )
        if grade_band:
            stmt = stmt.where(
                Embedding.metadata_["grade_band"].astext == grade_band
            )

        result = await session.execute(stmt)
        rows = result.all()

        matches: list[StandardMatch] = []
        for row in rows:
            emb: Embedding = row[0]
            dist: float = row[1]
            meta = emb.metadata_ or {}
            matches.append(
                StandardMatch(
                    id=meta.get("id", str(emb.id)),
                    standard=emb.content,
                    subject=meta.get("subject", ""),
                    grade_band=meta.get("grade_band", ""),
                    domain=meta.get("domain", ""),
                    score=1.0 - dist,  # cosine similarity = 1 - cosine distance
                )
            )

        return matches

    # ------------------------------------------------------------------
    # In-memory keyword fallback
    # ------------------------------------------------------------------

    def _keyword_search(
        self,
        query: str,
        subject: str | None = None,
        grade_band: str | None = None,
        top_k: int = 5,
    ) -> list[StandardMatch]:
        """Keyword-overlap search over seed data."""
        results: list[StandardMatch] = []
        query_lower = query.lower()
        query_words = set(query_lower.split())

        for std in self._standards:
            if subject and std["subject"] != subject.upper():
                continue
            if grade_band and std["grade_band"] != grade_band:
                continue

            std_words = set(std["standard"].lower().split())
            std_words.update(std["domain"].lower().split("_"))
            overlap = len(query_words & std_words)
            if overlap > 0 or query_lower in std["standard"].lower() or query_lower in std["domain"].lower():
                score = overlap + (1.0 if query_lower in std["domain"].lower() else 0.0)
                results.append(StandardMatch(
                    id=std["id"],
                    standard=std["standard"],
                    subject=std["subject"],
                    grade_band=std["grade_band"],
                    domain=std["domain"],
                    score=max(score, 0.1),
                ))

        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]

    # ------------------------------------------------------------------
    # Write helpers
    # ------------------------------------------------------------------

    async def store_embedding(
        self,
        session: AsyncSession,
        content: str,
        embedding: list[float],
        collection: str = "curriculum_standards",
        metadata: dict[str, Any] | None = None,
    ) -> Embedding:
        """Insert a single embedding row and return it."""
        row = Embedding(
            id=uuid.uuid4(),
            collection=collection,
            content=content,
            metadata_=metadata or {},
            embedding=embedding,
        )
        session.add(row)
        await session.flush()
        return row

    async def batch_store_embeddings(
        self,
        session: AsyncSession,
        items: list[dict[str, Any]],
        collection: str = "curriculum_standards",
    ) -> int:
        """Bulk-insert embeddings.

        Each item in *items* must contain ``content``, ``embedding``, and
        optionally ``metadata``.

        Returns the number of rows inserted.
        """
        rows: list[Embedding] = []
        for item in items:
            rows.append(
                Embedding(
                    id=uuid.uuid4(),
                    collection=collection,
                    content=item["content"],
                    metadata_=item.get("metadata", {}),
                    embedding=item["embedding"],
                )
            )
        session.add_all(rows)
        await session.flush()
        return len(rows)
