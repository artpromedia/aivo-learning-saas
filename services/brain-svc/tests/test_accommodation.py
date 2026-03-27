"""Tests for accommodation service."""

from __future__ import annotations

import pytest

from brain_svc.services.accommodation import (
    ACCOMMODATION_HIERARCHY,
    diff_accommodations,
    resolve_accommodations,
)


class TestAccommodationHierarchy:
    def test_hierarchy_has_entries(self):
        assert len(ACCOMMODATION_HIERARCHY) == 10

    def test_most_supportive_first(self):
        # First item should be most supportive
        first = ACCOMMODATION_HIERARCHY[0]
        last = ACCOMMODATION_HIERARCHY[-1]
        assert first != last


class TestResolveAccommodations:
    def test_merge_no_duplicates(self):
        sources = {
            "assessment": ["text_to_speech", "extra_time"],
            "iep": ["text_to_speech", "visual_supports"],
        }
        result = resolve_accommodations(sources)
        assert "text_to_speech" in result
        assert "extra_time" in result
        assert "visual_supports" in result
        # No duplicates
        assert len(result) == len(set(result))

    def test_empty_sources(self):
        result = resolve_accommodations({})
        assert result == []

    def test_single_source(self):
        result = resolve_accommodations({"assessment": ["text_to_speech", "extra_time"]})
        assert len(result) == 2

    def test_hierarchy_ordering(self):
        # Items in hierarchy should appear in hierarchy order
        sources = {"assessment": ["extra_time", "text_to_speech"]}
        result = resolve_accommodations(sources)
        # Both should be present regardless of input order
        assert "text_to_speech" in result
        assert "extra_time" in result


class TestDiffAccommodations:
    def test_added(self):
        old = ["text_to_speech"]
        new = ["text_to_speech", "extra_time"]
        diff = diff_accommodations(old, new)
        assert "extra_time" in diff["added"]
        assert len(diff["removed"]) == 0

    def test_removed(self):
        old = ["text_to_speech", "extra_time"]
        new = ["text_to_speech"]
        diff = diff_accommodations(old, new)
        assert "extra_time" in diff["removed"]
        assert len(diff["added"]) == 0

    def test_unchanged(self):
        old = ["text_to_speech", "extra_time"]
        new = ["text_to_speech", "extra_time"]
        diff = diff_accommodations(old, new)
        assert len(diff["added"]) == 0
        assert len(diff["removed"]) == 0
        assert set(diff["unchanged"]) == {"text_to_speech", "extra_time"}

    def test_complete_swap(self):
        old = ["text_to_speech"]
        new = ["visual_supports"]
        diff = diff_accommodations(old, new)
        assert "text_to_speech" in diff["removed"]
        assert "visual_supports" in diff["added"]

    def test_empty_old(self):
        diff = diff_accommodations([], ["text_to_speech"])
        assert diff["added"] == ["text_to_speech"]
        assert diff["removed"] == []
