"""Tests for functioning level, IEP profile, tutor registry, functional curriculum,
and episodic memory services — filling coverage gaps."""

from __future__ import annotations

import uuid
from unittest.mock import patch, AsyncMock

import pytest

from brain_svc.services.functioning_level import (
    CONTENT_RULES,
    FUNCTIONING_LEVELS,
    get_content_rules,
    update_functioning_level,
    validate_functioning_level,
)
from brain_svc.services.iep_profile import (
    confirm_iep_document,
    create_iep_document,
    create_iep_goal,
    get_iep_documents,
    get_iep_goals,
    update_iep_goal_progress,
)
from brain_svc.services.tutor_registry import (
    activate_tutor,
    deactivate_tutor,
    get_active_tutors,
)
from brain_svc.services.functional_curriculum import (
    create_milestone,
    get_learner_milestones,
    get_milestones,
    update_milestone_status,
)
from brain_svc.services.episodic_memory import (
    append_episode,
    archive_episodes,
    read_recent_episodes,
)


class TestFunctioningLevel:
    def test_all_levels_present(self):
        assert len(FUNCTIONING_LEVELS) == 5

    def test_validate_valid(self):
        assert validate_functioning_level("STANDARD") is True
        assert validate_functioning_level("PRE_SYMBOLIC") is True

    def test_validate_invalid(self):
        assert validate_functioning_level("INVALID") is False

    def test_content_rules_standard(self):
        rules = get_content_rules("STANDARD")
        assert rules["max_choices"] == 4
        assert rules["visual_support"] is False

    def test_content_rules_non_verbal(self):
        rules = get_content_rules("NON_VERBAL")
        assert rules["max_choices"] == 2
        assert rules["partner_support"] is True

    def test_content_rules_unknown_defaults_to_standard(self):
        rules = get_content_rules("UNKNOWN")
        assert rules == CONTENT_RULES["STANDARD"]

    @pytest.mark.asyncio
    async def test_update_functioning_level(self, session, brain_state, mock_redis):
        with patch("brain_svc.services.brain_state.get_redis", return_value=mock_redis):
            result = await update_functioning_level(
                session, brain_state, "SUPPORTED", "assessment"
            )
            assert result["changed"] is True
            assert result["new_level"] == "SUPPORTED"

    @pytest.mark.asyncio
    async def test_update_same_level_no_change(self, session, brain_state, mock_redis):
        with patch("brain_svc.services.brain_state.get_redis", return_value=mock_redis):
            result = await update_functioning_level(
                session, brain_state, "STANDARD", "manual"
            )
            assert result["changed"] is False

    @pytest.mark.asyncio
    async def test_update_invalid_level_raises(self, session, brain_state):
        with pytest.raises(ValueError, match="Invalid functioning level"):
            await update_functioning_level(session, brain_state, "BOGUS")


class TestIepProfile:
    @pytest.mark.asyncio
    async def test_create_document(self, session, brain_state):
        doc = await create_iep_document(
            session, str(brain_state.learner_id),
            uploaded_by=str(uuid.uuid4()),
            file_url="https://example.com/iep.pdf",
            file_type="PDF",
        )
        assert doc.id is not None
        assert doc.parse_status == "PENDING"

    @pytest.mark.asyncio
    async def test_get_documents(self, session, brain_state):
        await create_iep_document(
            session, str(brain_state.learner_id),
            uploaded_by=str(uuid.uuid4()),
            file_url="https://example.com/iep.pdf",
            file_type="PDF",
        )
        docs = await get_iep_documents(session, str(brain_state.learner_id))
        assert len(docs) >= 1

    @pytest.mark.asyncio
    async def test_confirm_document(self, session, brain_state):
        doc = await create_iep_document(
            session, str(brain_state.learner_id),
            uploaded_by=str(uuid.uuid4()),
            file_url="https://example.com/iep2.pdf",
            file_type="PDF",
        )
        confirmed = await confirm_iep_document(session, doc, str(uuid.uuid4()))
        assert confirmed.confirmed_at is not None

    @pytest.mark.asyncio
    async def test_create_goal(self, session, brain_state):
        doc = await create_iep_document(
            session, str(brain_state.learner_id),
            uploaded_by=str(uuid.uuid4()),
            file_url="https://example.com/iep3.pdf",
            file_type="PDF",
        )
        goal = await create_iep_goal(
            session,
            learner_id=str(brain_state.learner_id),
            iep_document_id=str(doc.id),
            goal_text="Improve reading fluency",
            domain="ELA",
            target_metric="wpm",
            target_value=80.0,
        )
        assert goal.status == "ACTIVE"
        assert goal.current_value == 0.0

    @pytest.mark.asyncio
    async def test_get_goals(self, session, brain_state):
        doc = await create_iep_document(
            session, str(brain_state.learner_id),
            uploaded_by=str(uuid.uuid4()),
            file_url="https://example.com/iep4.pdf",
            file_type="PDF",
        )
        await create_iep_goal(
            session, str(brain_state.learner_id), str(doc.id),
            "Goal 1", "MATH", "accuracy", 90.0,
        )
        goals = await get_iep_goals(session, str(brain_state.learner_id))
        assert len(goals) >= 1

    @pytest.mark.asyncio
    async def test_update_goal_progress(self, session, brain_state):
        doc = await create_iep_document(
            session, str(brain_state.learner_id),
            uploaded_by=str(uuid.uuid4()),
            file_url="https://example.com/iep5.pdf",
            file_type="PDF",
        )
        goal = await create_iep_goal(
            session, str(brain_state.learner_id), str(doc.id),
            "Goal 2", "MATH", "accuracy", 90.0,
        )
        updated = await update_iep_goal_progress(session, goal, 50.0)
        assert updated.current_value == 50.0
        assert updated.status == "ACTIVE"

    @pytest.mark.asyncio
    async def test_goal_auto_met(self, session, brain_state):
        doc = await create_iep_document(
            session, str(brain_state.learner_id),
            uploaded_by=str(uuid.uuid4()),
            file_url="https://example.com/iep6.pdf",
            file_type="PDF",
        )
        goal = await create_iep_goal(
            session, str(brain_state.learner_id), str(doc.id),
            "Goal 3", "MATH", "accuracy", 90.0,
        )
        updated = await update_iep_goal_progress(session, goal, 95.0)
        assert updated.status == "MET"
        assert updated.met_at is not None


class TestTutorRegistry:
    @pytest.mark.asyncio
    async def test_get_active_empty(self, session, brain_state):
        tutors = await get_active_tutors(brain_state)
        assert tutors == []

    @pytest.mark.asyncio
    async def test_activate_tutor(self, session, brain_state, mock_redis):
        tutor_id = str(uuid.uuid4())
        with patch("brain_svc.services.brain_state.get_redis", return_value=mock_redis):
            result = await activate_tutor(session, brain_state, tutor_id, "ADDON", "MATH")
        assert any(t["tutor_id"] == tutor_id for t in result)
        tutors = await get_active_tutors(brain_state)
        assert any(t["tutor_id"] == tutor_id for t in tutors)

    @pytest.mark.asyncio
    async def test_activate_duplicate(self, session, brain_state, mock_redis):
        tutor_id = str(uuid.uuid4())
        with patch("brain_svc.services.brain_state.get_redis", return_value=mock_redis):
            await activate_tutor(session, brain_state, tutor_id, "ADDON", "MATH")
            result = await activate_tutor(session, brain_state, tutor_id, "ADDON", "MATH")
        assert sum(1 for t in result if t["tutor_id"] == tutor_id) == 1

    @pytest.mark.asyncio
    async def test_deactivate_tutor(self, session, brain_state, mock_redis):
        tutor_id = str(uuid.uuid4())
        with patch("brain_svc.services.brain_state.get_redis", return_value=mock_redis):
            await activate_tutor(session, brain_state, tutor_id, "ADDON", "MATH")
            result = await deactivate_tutor(session, brain_state, tutor_id)
        assert all(t["tutor_id"] != tutor_id for t in result)


class TestFunctionalCurriculum:
    @pytest.mark.asyncio
    async def test_create_milestone(self, session):
        ms = await create_milestone(
            session, "ADL", "Brushing Teeth",
            "Can brush teeth independently", 1,
        )
        assert ms.id is not None
        assert ms.domain == "ADL"

    @pytest.mark.asyncio
    async def test_get_milestones(self, session):
        await create_milestone(session, "COMM", "Greeting", "Says hello", 1)
        milestones = await get_milestones(session)
        assert len(milestones) >= 1

    @pytest.mark.asyncio
    async def test_learner_milestone_tracking(self, session, brain_state):
        ms = await create_milestone(
            session, "MOTOR", "Walking", "Walks independently", 1,
        )
        updated = await update_milestone_status(
            session, str(brain_state.learner_id), str(ms.id),
            "EMERGING", "Took first steps",
        )
        assert updated.status == "EMERGING"
        assert len(updated.observations) == 1

    @pytest.mark.asyncio
    async def test_get_learner_milestones(self, session, brain_state):
        ms = await create_milestone(
            session, "SOCIAL", "Turn-taking", "Takes turns in play", 1,
        )
        await update_milestone_status(
            session, str(brain_state.learner_id), str(ms.id),
            "MASTERED", "Consistent",
        )
        learner_ms = await get_learner_milestones(
            session, str(brain_state.learner_id)
        )
        assert len(learner_ms) >= 1


class TestEpisodicMemory:
    @pytest.mark.asyncio
    async def test_append_episode(self, mock_redis):
        with patch("brain_svc.services.episodic_memory.get_redis", return_value=mock_redis):
            result = await append_episode(
                str(uuid.uuid4()), "TEST_EVENT", {"key": "value"}
            )
            assert result is not None
            mock_redis.xadd.assert_called_once()

    @pytest.mark.asyncio
    async def test_read_recent(self, mock_redis):
        mock_redis.xrevrange.return_value = [
            ("1-0", {"event_type": "A", "payload": '{"x":1}'}),
        ]
        with patch("brain_svc.services.episodic_memory.get_redis", return_value=mock_redis):
            episodes = await read_recent_episodes(str(uuid.uuid4()))
            assert len(episodes) == 1

    @pytest.mark.asyncio
    async def test_archive_episodes(self, session, brain_state, mock_redis):
        mock_redis.xrange.return_value = [
            ("1-0", {
                "event_type": "TEST",
                "payload": '{"data": "test"}',
                "brain_state_id": str(brain_state.id),
            }),
        ]
        with patch("brain_svc.services.episodic_memory.get_redis", return_value=mock_redis):
            count = await archive_episodes(
                session,
                str(brain_state.id),
                str(brain_state.learner_id),
            )
            assert count == 1
            mock_redis.xdel.assert_called_once()
