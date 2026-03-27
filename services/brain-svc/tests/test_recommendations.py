"""Tests for recommendation service."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import pytest

from brain_svc.models.recommendation import Recommendation
from brain_svc.services.recommendation import (
    RECOMMENDATION_TYPES,
    can_re_trigger,
    create_recommendation,
    generate_mastery_celebration,
    generate_regression_recommendation,
    get_recommendation_by_id,
    get_recommendations,
    respond_to_recommendation,
)


class TestRecommendationTypes:
    def test_all_types_present(self):
        assert len(RECOMMENDATION_TYPES) == 13
        assert "REGRESSION_ALERT" in RECOMMENDATION_TYPES
        assert "MASTERY_CELEBRATION" in RECOMMENDATION_TYPES


class TestCreateRecommendation:
    @pytest.mark.asyncio
    async def test_create_basic(self, session, brain_state):
        rec = await create_recommendation(
            session=session,
            brain_state_id=str(brain_state.id),
            learner_id=str(brain_state.learner_id),
            rec_type="REGRESSION_ALERT",
            title="Test Alert",
            description="Test description",
            payload={"skill": "MATH"},
        )
        assert rec.id is not None
        assert rec.status == "PENDING"
        assert rec.type == "REGRESSION_ALERT"

    @pytest.mark.asyncio
    async def test_get_by_id(self, session, brain_state):
        rec = await create_recommendation(
            session=session,
            brain_state_id=str(brain_state.id),
            learner_id=str(brain_state.learner_id),
            rec_type="MASTERY_CELEBRATION",
            title="Great job!",
            description="You mastered MATH",
            payload={},
        )
        found = await get_recommendation_by_id(session, str(rec.id))
        assert found is not None
        assert found.title == "Great job!"

    @pytest.mark.asyncio
    async def test_get_by_learner(self, session, brain_state):
        await create_recommendation(
            session=session,
            brain_state_id=str(brain_state.id),
            learner_id=str(brain_state.learner_id),
            rec_type="TUTOR_UPGRADE",
            title="Upgrade",
            description="Upgrade tutor",
            payload={},
        )
        recs = await get_recommendations(session, str(brain_state.learner_id))
        assert len(recs) >= 1

    @pytest.mark.asyncio
    async def test_filter_by_status(self, session, brain_state):
        await create_recommendation(
            session=session,
            brain_state_id=str(brain_state.id),
            learner_id=str(brain_state.learner_id),
            rec_type="ACCOMMODATION_ADD",
            title="Add accommodation",
            description="desc",
            payload={},
        )
        recs = await get_recommendations(
            session, str(brain_state.learner_id), status="PENDING"
        )
        assert all(r.status == "PENDING" for r in recs)


class TestRespondToRecommendation:
    @pytest.mark.asyncio
    async def test_approve(self, session, brain_state):
        rec = await create_recommendation(
            session=session,
            brain_state_id=str(brain_state.id),
            learner_id=str(brain_state.learner_id),
            rec_type="TUTOR_ADDON",
            title="Add tutor",
            description="desc",
            payload={},
        )
        updated = await respond_to_recommendation(
            session, rec, "APPROVED", str(uuid.uuid4()), "Sounds good"
        )
        assert updated.status == "APPROVED"
        assert updated.parent_response_text == "Sounds good"
        assert updated.responded_at is not None

    @pytest.mark.asyncio
    async def test_invalid_status(self, session, brain_state):
        rec = await create_recommendation(
            session=session,
            brain_state_id=str(brain_state.id),
            learner_id=str(brain_state.learner_id),
            rec_type="TUTOR_ADDON",
            title="Test",
            description="desc",
            payload={},
        )
        with pytest.raises(ValueError, match="Invalid response status"):
            await respond_to_recommendation(
                session, rec, "INVALID", str(uuid.uuid4())
            )


class TestReTrigger:
    @pytest.mark.asyncio
    async def test_can_trigger_first_time(self, session):
        result = await can_re_trigger(session, str(uuid.uuid4()), "REGRESSION_ALERT")
        assert result is True


class TestGenerateRecommendations:
    @pytest.mark.asyncio
    async def test_regression_recommendation(self, session, brain_state):
        regressions = [
            {"skill": "MATH", "previous_level": 0.7, "current_level": 0.5, "drop": 0.2}
        ]
        rec = await generate_regression_recommendation(
            session, str(brain_state.id), str(brain_state.learner_id), regressions
        )
        assert rec is not None
        assert rec.type == "REGRESSION_ALERT"

    @pytest.mark.asyncio
    async def test_no_regression_no_recommendation(self, session, brain_state):
        rec = await generate_regression_recommendation(
            session, str(brain_state.id), str(brain_state.learner_id), []
        )
        assert rec is None

    @pytest.mark.asyncio
    async def test_mastery_celebration(self, session, brain_state):
        rec = await generate_mastery_celebration(
            session, str(brain_state.id), str(brain_state.learner_id),
            "MATH", 0.95,
        )
        assert rec is not None
        assert rec.type == "MASTERY_CELEBRATION"

    @pytest.mark.asyncio
    async def test_no_celebration_below_threshold(self, session, brain_state):
        rec = await generate_mastery_celebration(
            session, str(brain_state.id), str(brain_state.learner_id),
            "MATH", 0.7,
        )
        assert rec is None
