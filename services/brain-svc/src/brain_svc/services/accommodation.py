"""Accommodation resolution — merges accommodations from multiple sources.

Conflict resolution: "MORE SUPPORTIVE wins".
"""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

# Ordered from most to least supportive
ACCOMMODATION_HIERARCHY = [
    "switch_scan",
    "sensory_breaks",
    "partner_assisted",
    "large_touch_targets",
    "reduced_choices",
    "picture_support",
    "audio_narration",
    "text_to_speech",
    "chunked_text",
    "extended_time",
]


def resolve_accommodations(
    sources: dict[str, list[str]],
) -> list[str]:
    """Merge accommodations from multiple sources.

    sources: dict keyed by source name (e.g. "assessment", "iep", "functioning_level_defaults")
    Returns: de-duplicated list of accommodations sorted by support intensity.
    """
    merged: set[str] = set()
    for source_name, accommodations in sources.items():
        for acc in accommodations:
            merged.add(acc)

    # Sort by hierarchy (most supportive first), unknown ones go at the end
    hierarchy_map = {acc: i for i, acc in enumerate(ACCOMMODATION_HIERARCHY)}
    result = sorted(merged, key=lambda a: hierarchy_map.get(a, len(ACCOMMODATION_HIERARCHY)))

    logger.debug("Resolved accommodations from %d sources: %s", len(sources), result)
    return result


def diff_accommodations(
    current: list[str],
    proposed: list[str],
) -> dict[str, list[str]]:
    """Compute accommodation diff between current and proposed."""
    current_set = set(current)
    proposed_set = set(proposed)
    return {
        "added": sorted(proposed_set - current_set),
        "removed": sorted(current_set - proposed_set),
        "unchanged": sorted(current_set & proposed_set),
    }
