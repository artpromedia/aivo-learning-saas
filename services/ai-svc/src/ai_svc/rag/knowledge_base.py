"""Curriculum knowledge base backed by pgvector."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

logger = logging.getLogger(__name__)

# Seed curriculum standards data
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
    """In-memory curriculum knowledge base with keyword matching.

    For production, this would use pgvector for semantic search.
    The keyword-based approach provides a working implementation
    without requiring external embedding services.
    """

    def __init__(self) -> None:
        self._standards = CURRICULUM_STANDARDS

    def search(
        self,
        query: str,
        subject: str | None = None,
        grade_band: str | None = None,
        top_k: int = 5,
    ) -> list[StandardMatch]:
        """Search for relevant curriculum standards."""
        results: list[StandardMatch] = []
        query_lower = query.lower()
        query_words = set(query_lower.split())

        for std in self._standards:
            # Filter by subject/grade_band if specified
            if subject and std["subject"] != subject.upper():
                continue
            if grade_band and std["grade_band"] != grade_band:
                continue

            # Score by keyword overlap
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
