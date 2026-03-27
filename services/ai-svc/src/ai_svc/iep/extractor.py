"""Structured extraction models for IEP document parsing."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Accommodation:
    name: str
    description: str
    category: str = ""


@dataclass
class IEPGoal:
    goal_text: str
    domain: str
    target_metric: str = ""
    target_value: str = ""
    timeline: str = ""


@dataclass
class IEPExtraction:
    """Structured data extracted from an IEP document."""
    disability_categories: list[str] = field(default_factory=list)
    accommodations: list[Accommodation] = field(default_factory=list)
    goals: list[IEPGoal] = field(default_factory=list)
    grade_level: int | None = None
    communication_system: str | None = None
    assistive_technology: list[str] = field(default_factory=list)
    recommended_functioning_level: str | None = None
    raw_text: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "disability_categories": self.disability_categories,
            "accommodations": [
                {"name": a.name, "description": a.description, "category": a.category}
                for a in self.accommodations
            ],
            "goals": [
                {
                    "goal_text": g.goal_text,
                    "domain": g.domain,
                    "target_metric": g.target_metric,
                    "target_value": g.target_value,
                    "timeline": g.timeline,
                }
                for g in self.goals
            ],
            "grade_level": self.grade_level,
            "communication_system": self.communication_system,
            "assistive_technology": self.assistive_technology,
            "recommended_functioning_level": self.recommended_functioning_level,
        }
