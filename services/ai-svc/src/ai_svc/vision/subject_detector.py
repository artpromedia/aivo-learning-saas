"""Subject classification from extracted homework content.

Uses keyword/pattern analysis first; falls back to lightweight LLM call
when ambiguous.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from typing import Any

from ai_svc.llm.gateway import LLMGateway

logger = logging.getLogger(__name__)

VALID_SUBJECTS = {"MATH", "ELA", "SCIENCE", "HISTORY", "CODING", "OTHER"}

_SUBJECT_PATTERNS: dict[str, list[str]] = {
    "MATH": [
        r"\bequation\b", r"\bsolve\b", r"\bcalculate\b", r"\bx\s*=",
        r"\balgebra\b", r"\bfraction\b", r"\bmultipl", r"\bdivi[ds]",
        r"\bsubtract\b", r"\baddition\b", r"\bgeometr", r"\bangle\b",
        r"\btriangle\b", r"\bperimeter\b", r"\barea\b", r"\bvolume\b",
        r"\bpercent\b", r"\bdecimal\b", r"\bratio\b", r"\bproportion\b",
        r"\bgraph\b.*\b(plot|point|line)\b", r"\bpolynomial\b",
        r"\bsqrt\b", r"\\frac\{", r"\\times\b",
        r"\d+\s*[+\-*/×÷=]\s*\d+",
    ],
    "ELA": [
        r"\bread\b.*\b(passage|text|story)\b", r"\bwrite\b.*\b(essay|paragraph|sentence)\b",
        r"\bvocabulary\b", r"\bgrammar\b", r"\bcomprehension\b",
        r"\bspelling\b", r"\bsynonym\b", r"\bantonym\b",
        r"\bnarrative\b", r"\bauthor\b", r"\bmain idea\b",
        r"\bthesis\b", r"\btopic sentence\b", r"\bparagraph\b",
        r"\bpunctuat\b", r"\bnoun\b", r"\bverb\b", r"\badjective\b",
        r"\brhyme\b", r"\bpoem\b", r"\bpoetry\b", r"\bstanza\b",
        r"\bfiction\b", r"\bnonfiction\b",
    ],
    "SCIENCE": [
        r"\bexperiment\b", r"\bhypothesis\b", r"\bmolecule\b",
        r"\bcell\b.*\b(membrane|wall|organelle)\b", r"\benergy\b",
        r"\bphotosynthesis\b", r"\becosystem\b", r"\bhabitat\b",
        r"\bgravity\b", r"\bforce\b", r"\bvelocity\b",
        r"\bchemical\b", r"\breaction\b", r"\belement\b",
        r"\bperiodic table\b", r"\batom\b", r"\belectron\b",
        r"\bevolut\b", r"\bspecies\b", r"\bgenetic\b",
        r"\bscientific method\b", r"\blab\b", r"\bobserv",
    ],
    "HISTORY": [
        r"\bhistory\b", r"\bwar\b", r"\bpresident\b",
        r"\bcentury\b", r"\bcivilization\b", r"\bempire\b",
        r"\bcoloni", r"\brevolution\b", r"\bindependence\b",
        r"\bconstitution\b", r"\bamendment\b", r"\bdemocra",
        r"\bmonarchy\b", r"\brepublic\b", r"\bgeograph",
        r"\bcivil rights\b", r"\bworld war\b",
        r"\bancient\b", r"\bmedieval\b", r"\brenaissance\b",
    ],
    "CODING": [
        r"\bfunction\b.*\breturn\b", r"\bvariable\b",
        r"\bloop\b", r"\bif\s*\(", r"\bprint\s*\(",
        r"\balgorithm\b", r"\bpseudocode\b",
        r"\bclass\b.*\bdef\b", r"\bimport\b",
        r"\barray\b", r"\blist\b.*\bindex\b",
        r"\bboolean\b", r"\bdebug\b",
    ],
}

# Weighted confidence thresholds
_HIGH_CONFIDENCE_THRESHOLD = 0.7
_AMBIGUOUS_THRESHOLD = 0.4

_LLM_CLASSIFY_PROMPT = """Classify the subject of this homework content.
Return ONLY a JSON object: {"subject": "MATH|ELA|SCIENCE|HISTORY|CODING|OTHER", "confidence": 0.0-1.0}

Content:
"""


@dataclass
class DetectedSubject:
    """Subject detection result."""
    subject: str
    confidence: float
    method: str  # "pattern" or "llm"

    def to_dict(self) -> dict[str, Any]:
        return {
            "subject": self.subject,
            "confidence": self.confidence,
            "method": self.method,
        }


class SubjectDetector:
    """Classifies homework subject from extracted content."""

    def __init__(self, gateway: LLMGateway) -> None:
        self._gateway = gateway

    async def detect(self, text: str) -> DetectedSubject:
        """Detect subject from extracted content.

        Uses keyword/pattern analysis first. If ambiguous (close scores
        between subjects), falls back to a lightweight LLM classification.

        Args:
            text: Combined extracted text from the document.

        Returns:
            DetectedSubject with subject, confidence, and detection method.
        """
        if not text or not text.strip():
            return DetectedSubject(subject="OTHER", confidence=0.0, method="pattern")

        scores = self._score_patterns(text)

        if not scores:
            return await self._llm_classify(text)

        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_subject, top_score = sorted_scores[0]
        second_score = sorted_scores[1][1] if len(sorted_scores) > 1 else 0.0

        # High confidence from patterns
        if top_score >= _HIGH_CONFIDENCE_THRESHOLD:
            return DetectedSubject(
                subject=top_subject,
                confidence=top_score,
                method="pattern",
            )

        # Ambiguous - scores too close together
        if top_score < _AMBIGUOUS_THRESHOLD or (top_score - second_score) < 0.15:
            return await self._llm_classify(text)

        return DetectedSubject(
            subject=top_subject,
            confidence=top_score,
            method="pattern",
        )

    def _score_patterns(self, text: str) -> dict[str, float]:
        """Score each subject based on pattern matches."""
        text_lower = text.lower()
        scores: dict[str, float] = {}

        for subject, patterns in _SUBJECT_PATTERNS.items():
            match_count = 0
            for pattern in patterns:
                matches = re.findall(pattern, text_lower, re.IGNORECASE)
                match_count += len(matches)

            if match_count > 0:
                # Normalize: more matches = higher confidence, max 1.0
                scores[subject] = min(1.0, match_count / (len(patterns) * 0.5))

        return scores

    async def _llm_classify(self, text: str) -> DetectedSubject:
        """Use LLM for subject classification when patterns are ambiguous."""
        import json

        truncated = text[:2000]

        try:
            from ai_svc.llm.tier_router import Tier

            response = await self._gateway.generate(
                messages=[
                    {"role": "system", "content": _LLM_CLASSIFY_PROMPT},
                    {"role": "user", "content": truncated},
                ],
                task_type="subject_classification",
                tier=Tier.FAST,
                max_tokens=100,
                temperature=0.1,
            )

            clean = response.content.strip()
            if clean.startswith("```"):
                lines = clean.split("\n")
                clean = "\n".join(lines[1:-1]) if len(lines) > 2 else clean

            data = json.loads(clean)
            subject = data.get("subject", "OTHER").upper()
            confidence = float(data.get("confidence", 0.5))

            if subject not in VALID_SUBJECTS:
                subject = "OTHER"

            return DetectedSubject(
                subject=subject,
                confidence=confidence,
                method="llm",
            )
        except Exception:
            logger.warning("LLM subject classification failed", exc_info=True)
            return DetectedSubject(subject="OTHER", confidence=0.0, method="pattern")
