"""Quality gate shared types."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class GateResult:
    """Result from a single quality gate."""
    name: str
    passed: bool
    details: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class QualityResult:
    """Aggregated result from the full quality gate pipeline."""
    passed: bool
    gates: list[GateResult]
    content: str
