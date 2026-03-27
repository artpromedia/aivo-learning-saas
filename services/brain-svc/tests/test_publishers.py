"""Tests for NATS event publishers."""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, patch

import pytest

from brain_svc.events.publishers import (
    publish_brain_cloned,
    publish_brain_updated,
    publish_functioning_level_changed,
    publish_iep_goal_met,
    publish_mastery_updated,
    publish_recommendation_created,
    publish_recommendation_responded,
    publish_regression_detected,
    publish_snapshot_created,
)


@pytest.fixture
def mock_publish():
    with patch("brain_svc.events.publishers.publish_event", new_callable=AsyncMock) as mock:
        yield mock


class TestPublishBrainCloned:
    @pytest.mark.asyncio
    async def test_publishes_correct_subject(self, mock_publish):
        await publish_brain_cloned(
            learner_id="l1",
            brain_state_id="bs1",
            main_brain_version="v3.0",
            functioning_level="STANDARD",
        )
        mock_publish.assert_called_once_with("aivo.brain.cloned", {
            "learnerId": "l1",
            "brainStateId": "bs1",
            "mainBrainVersion": "v3.0",
            "functioningLevel": "STANDARD",
        })


class TestPublishBrainUpdated:
    @pytest.mark.asyncio
    async def test_publishes(self, mock_publish):
        await publish_brain_updated(
            learner_id="l1",
            brain_state_id="bs1",
            changes={"state": {"mastery_levels": {"MATH": 0.6}}},
        )
        mock_publish.assert_called_once()
        args = mock_publish.call_args
        assert args[0][0] == "aivo.brain.updated"
        assert args[0][1]["learnerId"] == "l1"


class TestPublishSnapshotCreated:
    @pytest.mark.asyncio
    async def test_publishes(self, mock_publish):
        await publish_snapshot_created(
            brain_state_id="bs1",
            snapshot_id="snap1",
            trigger="INITIAL_CLONE",
            version_number=1,
        )
        mock_publish.assert_called_once()
        args = mock_publish.call_args
        assert args[0][0] == "aivo.brain.snapshot.created"


class TestPublishMasteryUpdated:
    @pytest.mark.asyncio
    async def test_publishes(self, mock_publish):
        await publish_mastery_updated(
            learner_id="l1",
            skill="MATH",
            previous_level=0.5,
            new_level=0.6,
            delta=0.1,
        )
        mock_publish.assert_called_once()
        data = mock_publish.call_args[0][1]
        assert data["skill"] == "MATH"
        assert data["delta"] == 0.1


class TestPublishRecommendationCreated:
    @pytest.mark.asyncio
    async def test_publishes(self, mock_publish):
        await publish_recommendation_created(
            learner_id="l1",
            recommendation_id="r1",
            rec_type="REGRESSION_ALERT",
            title="Alert",
        )
        mock_publish.assert_called_once()
        assert mock_publish.call_args[0][0] == "aivo.brain.recommendation.created"


class TestPublishRecommendationResponded:
    @pytest.mark.asyncio
    async def test_publishes(self, mock_publish):
        await publish_recommendation_responded(
            learner_id="l1",
            recommendation_id="r1",
            status="APPROVED",
            responded_by="p1",
        )
        mock_publish.assert_called_once()
        assert mock_publish.call_args[0][0] == "aivo.brain.recommendation.responded"


class TestPublishIepGoalMet:
    @pytest.mark.asyncio
    async def test_publishes(self, mock_publish):
        await publish_iep_goal_met(
            learner_id="l1",
            goal_id="g1",
            domain="ELA",
        )
        mock_publish.assert_called_once()
        assert mock_publish.call_args[0][0] == "aivo.brain.iep_goal.met"


class TestPublishFunctioningLevelChanged:
    @pytest.mark.asyncio
    async def test_publishes(self, mock_publish):
        await publish_functioning_level_changed(
            learner_id="l1",
            previous_level="STANDARD",
            new_level="SUPPORTED",
            reason="assessment-based",
        )
        mock_publish.assert_called_once()
        assert mock_publish.call_args[0][0] == "aivo.brain.functioning_level.changed"


class TestPublishRegressionDetected:
    @pytest.mark.asyncio
    async def test_publishes(self, mock_publish):
        await publish_regression_detected(
            learner_id="l1",
            regressions=[{"skill": "MATH", "drop": 0.2}],
        )
        mock_publish.assert_called_once()
        assert mock_publish.call_args[0][0] == "aivo.brain.regression.detected"
