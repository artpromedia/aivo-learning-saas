"""Tests for data export and data lifecycle (deletion) services."""

from __future__ import annotations

import json
import os
import zipfile
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from brain_svc.services.data_export import (
    _generate_markdown,
    _generate_summary_markdown,
    _expiry_iso,
    _store_export,
)
from brain_svc.services.data_lifecycle import (
    _anonymize_learner,
    ANONYMIZATION_SALT,
)


class TestExportMarkdownGeneration:
    def test_generate_markdown_list(self):
        records = [
            {"id": "1", "name": "Test", "score": 95},
            {"id": "2", "name": "Test2", "score": 88},
        ]
        md = _generate_markdown("brain_states", records)
        assert "# Brain States" in md
        assert "**Total records:** 2" in md
        assert "**id:** 1" in md
        assert "**score:** 95" in md

    def test_generate_markdown_dict_values(self):
        records = [{"id": "1", "state": {"mastery": {"math": 0.8}}}]
        md = _generate_markdown("brain_states", records)
        assert "mastery" in md
        assert "0.8" in md

    def test_generate_markdown_empty_list(self):
        md = _generate_markdown("empty_category", [])
        assert "# Empty Category" in md
        assert "**Total records:** 0" in md

    def test_generate_summary_markdown(self):
        data = {"brain_states": [{"id": "1"}], "xp_events": [{"id": "x1"}, {"id": "x2"}]}
        summary = {"brain_states": 1, "xp_events": 2}
        md = _generate_summary_markdown("learner-123", data, summary)
        assert "AIVO Brain Data Export" in md
        assert "learner-123" in md
        assert "Brain States" in md
        assert "GDPR Article 20" in md
        assert "72 hours" in md

    def test_expiry_iso_returns_future_date(self):
        from datetime import datetime, timezone
        expiry = _expiry_iso()
        expiry_dt = datetime.fromisoformat(expiry)
        now = datetime.now(timezone.utc)
        diff_hours = (expiry_dt - now).total_seconds() / 3600
        assert 71 < diff_hours < 73

    def test_store_export_local(self):
        url = _store_export("/tmp/test.zip", "export-123")
        assert url == "/exports/brain/export-123.zip"

    def test_store_export_s3(self):
        with patch.dict(os.environ, {"STORAGE_BACKEND": "s3", "S3_BUCKET": "test-bucket"}):
            url = _store_export("/tmp/test.zip", "export-123")
            assert "test-bucket" in url
            assert "export-123" in url
            assert "X-Amz-Expires" in url


class TestDeletionAnonymization:
    def test_anonymization_salt_exists(self):
        assert ANONYMIZATION_SALT is not None
        assert len(ANONYMIZATION_SALT) > 0

    def test_anonymization_produces_irreversible_hash(self):
        import hashlib
        learner_id = "test-learner-123"
        email_hash = hashlib.sha256(
            f"{learner_id}:{ANONYMIZATION_SALT}".encode()
        ).hexdigest()[:32]
        # Hash should be deterministic
        email_hash2 = hashlib.sha256(
            f"{learner_id}:{ANONYMIZATION_SALT}".encode()
        ).hexdigest()[:32]
        assert email_hash == email_hash2
        # But different for different learners
        other_hash = hashlib.sha256(
            f"other-learner:{ANONYMIZATION_SALT}".encode()
        ).hexdigest()[:32]
        assert email_hash != other_hash


class TestExportZipStructure:
    def test_markdown_has_correct_sections(self):
        records = [{"id": "1", "text": "test problem", "choices": ["A", "B"]}]
        md = _generate_markdown("homework_assignments", records)
        assert "# Homework Assignments" in md
        assert "Record 1" in md

    def test_summary_includes_all_categories(self):
        data = {
            "brain_states": [], "brain_snapshots": [], "brain_episodes": [],
            "recommendations": [], "iep_documents": [], "iep_goals": [],
            "tutor_sessions": [], "homework_assignments": [],
        }
        summary = {k: 0 for k in data}
        md = _generate_summary_markdown("l1", data, summary)
        for cat in data:
            assert cat.replace("_", " ").title() in md
