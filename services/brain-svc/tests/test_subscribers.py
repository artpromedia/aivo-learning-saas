"""Tests for NATS event subscribers."""

from __future__ import annotations

import json
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from brain_svc.events.subscribers import (
    _get_model_store,
    _on_assessment_baseline_completed,
    _on_homework_session_completed,
    _on_iep_confirmed,
    _on_lesson_completed,
    _on_quiz_completed,
    _on_tutor_addon_activated,
    _on_tutor_addon_deactivated,
    _on_tutor_session_completed,
    _parse_msg,
    _process_learning_event,
    setup_subscriptions,
)


def _make_msg(data: dict) -> MagicMock:
    """Create a mock NATS message."""
    msg = AsyncMock()
    msg.data = json.dumps(data).encode()
    msg.ack = AsyncMock()
    msg.nak = AsyncMock()
    return msg


class TestParseMsg:
    def test_parse_msg(self):
        msg = MagicMock()
        msg.data = json.dumps({"key": "value"}).encode()
        result = _parse_msg(msg)
        assert result == {"key": "value"}


class TestGetModelStore:
    def test_get_model_store(self, tmp_path):
        import brain_svc.events.subscribers as mod
        mod._model_store = None
        with patch("brain_svc.events.subscribers.get_settings") as mock_settings:
            mock_settings.return_value.model_store_dir = str(tmp_path)
            store = _get_model_store()
            assert store is not None
            # Calling again returns cached
            store2 = _get_model_store()
            assert store is store2
        mod._model_store = None  # Reset


class TestSetupSubscriptions:
    @pytest.mark.asyncio
    async def test_setup_with_existing_stream(self):
        mock_js = AsyncMock()
        mock_js.find_stream_name_by_subject = AsyncMock(return_value="AIVO_BRAIN")
        mock_js.subscribe = AsyncMock()
        with patch("brain_svc.events.subscribers.get_jetstream", return_value=mock_js):
            await setup_subscriptions()
            assert mock_js.subscribe.call_count == 8

    @pytest.mark.asyncio
    async def test_setup_creates_stream_if_not_found(self):
        mock_js = AsyncMock()
        mock_js.find_stream_name_by_subject = AsyncMock(side_effect=Exception("not found"))
        mock_js.add_stream = AsyncMock()
        mock_js.subscribe = AsyncMock()
        with patch("brain_svc.events.subscribers.get_jetstream", return_value=mock_js):
            await setup_subscriptions()
            mock_js.add_stream.assert_called_once()
            assert mock_js.subscribe.call_count == 8


class TestOnAssessmentBaselineCompleted:
    @pytest.mark.asyncio
    async def test_success(self, tmp_path):
        learner_id = str(uuid.uuid4())
        data = {
            "learnerId": learner_id,
            "assessmentId": str(uuid.uuid4()),
            "domains": {"MATH": 0.6},
            "functioningLevel": "STANDARD",
            "enrolledGrade": 3,
        }
        msg = _make_msg(data)
        result = {
            "brain_state_id": str(uuid.uuid4()),
            "main_brain_version": "aivo-brain-v3.0",
            "functioning_level": "STANDARD",
        }

        with patch("brain_svc.events.subscribers._get_model_store") as mock_ms, \
             patch("brain_svc.events.subscribers.get_session") as mock_gs, \
             patch("brain_svc.events.subscribers.publish_brain_cloned", new_callable=AsyncMock):
            mock_ms.return_value = MagicMock()
            mock_session = AsyncMock()
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.services.brain_clone.clone_brain", return_value=result):
                await _on_assessment_baseline_completed(msg)
            msg.ack.assert_called_once()

    @pytest.mark.asyncio
    async def test_error_naks(self):
        msg = _make_msg({"bad": "data"})
        with patch("brain_svc.events.subscribers._get_model_store", side_effect=Exception("fail")):
            await _on_assessment_baseline_completed(msg)
        msg.nak.assert_called_once()


class TestProcessLearningEvent:
    @pytest.mark.asyncio
    async def test_lesson_completed(self):
        learner_id = str(uuid.uuid4())
        data = {
            "learnerId": learner_id,
            "skill": "MATH",
            "masteryDelta": 0.1,
            "sessionId": str(uuid.uuid4()),
        }
        msg = _make_msg(data)
        fake_bs = MagicMock()
        fake_result = MagicMock()
        fake_result.skill = "MATH"
        fake_result.previous_level = 0.5
        fake_result.new_level = 0.6
        fake_result.delta = 0.1

        with patch("brain_svc.events.subscribers._get_model_store") as mock_ms, \
             patch("brain_svc.events.subscribers.get_session") as mock_gs, \
             patch("brain_svc.events.subscribers.publish_mastery_updated", new_callable=AsyncMock):
            mock_ms.return_value = MagicMock()
            mock_session = AsyncMock()
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.services.brain_state.get_brain_state", return_value=fake_bs), \
                 patch("brain_svc.services.mastery.process_mastery_update", return_value=fake_result):
                await _on_lesson_completed(msg)
            msg.ack.assert_called_once()

    @pytest.mark.asyncio
    async def test_no_brain_state_skips(self):
        msg = _make_msg({"learnerId": str(uuid.uuid4()), "skill": "MATH"})
        with patch("brain_svc.events.subscribers._get_model_store") as mock_ms, \
             patch("brain_svc.events.subscribers.get_session") as mock_gs:
            mock_ms.return_value = MagicMock()
            mock_session = AsyncMock()
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.services.brain_state.get_brain_state", return_value=None):
                await _on_lesson_completed(msg)
            msg.ack.assert_called_once()

    @pytest.mark.asyncio
    async def test_error_naks(self):
        msg = _make_msg({"learnerId": str(uuid.uuid4())})
        with patch("brain_svc.events.subscribers._get_model_store", side_effect=Exception("fail")):
            await _on_lesson_completed(msg)
        msg.nak.assert_called_once()

    @pytest.mark.asyncio
    async def test_quiz_completed(self):
        msg = _make_msg({"learnerId": str(uuid.uuid4()), "subject": "SCIENCE"})
        fake_bs = MagicMock()
        fake_result = MagicMock(skill="SCIENCE", previous_level=0.3, new_level=0.35, delta=0.05)

        with patch("brain_svc.events.subscribers._get_model_store") as mock_ms, \
             patch("brain_svc.events.subscribers.get_session") as mock_gs, \
             patch("brain_svc.events.subscribers.publish_mastery_updated", new_callable=AsyncMock):
            mock_ms.return_value = MagicMock()
            mock_session = AsyncMock()
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.services.brain_state.get_brain_state", return_value=fake_bs), \
                 patch("brain_svc.services.mastery.process_mastery_update", return_value=fake_result):
                await _on_quiz_completed(msg)
            msg.ack.assert_called_once()

    @pytest.mark.asyncio
    async def test_tutor_session_completed(self):
        msg = _make_msg({"learnerId": str(uuid.uuid4()), "skill": "ELA"})
        fake_bs = MagicMock()
        fake_result = MagicMock(skill="ELA", previous_level=0.4, new_level=0.45, delta=0.05)

        with patch("brain_svc.events.subscribers._get_model_store") as mock_ms, \
             patch("brain_svc.events.subscribers.get_session") as mock_gs, \
             patch("brain_svc.events.subscribers.publish_mastery_updated", new_callable=AsyncMock):
            mock_ms.return_value = MagicMock()
            mock_session = AsyncMock()
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.services.brain_state.get_brain_state", return_value=fake_bs), \
                 patch("brain_svc.services.mastery.process_mastery_update", return_value=fake_result):
                await _on_tutor_session_completed(msg)
            msg.ack.assert_called_once()

    @pytest.mark.asyncio
    async def test_homework_completed(self):
        msg = _make_msg({"learnerId": str(uuid.uuid4()), "subject": "HISTORY"})
        fake_bs = MagicMock()
        fake_result = MagicMock(skill="HISTORY", previous_level=0.2, new_level=0.25, delta=0.05)

        with patch("brain_svc.events.subscribers._get_model_store") as mock_ms, \
             patch("brain_svc.events.subscribers.get_session") as mock_gs, \
             patch("brain_svc.events.subscribers.publish_mastery_updated", new_callable=AsyncMock):
            mock_ms.return_value = MagicMock()
            mock_session = AsyncMock()
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.services.brain_state.get_brain_state", return_value=fake_bs), \
                 patch("brain_svc.services.mastery.process_mastery_update", return_value=fake_result):
                await _on_homework_session_completed(msg)
            msg.ack.assert_called_once()


class TestOnTutorAddonActivated:
    @pytest.mark.asyncio
    async def test_success(self):
        learner_id = str(uuid.uuid4())
        data = {
            "learnerId": learner_id,
            "tutorId": "tutor-1",
            "tutorType": "ADDON",
            "subject": "MATH",
        }
        msg = _make_msg(data)
        fake_bs = MagicMock()

        with patch("brain_svc.events.subscribers.get_session") as mock_gs:
            mock_session = AsyncMock()
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.services.brain_state.get_brain_state", return_value=fake_bs), \
                 patch("brain_svc.services.tutor_registry.activate_tutor", new_callable=AsyncMock):
                await _on_tutor_addon_activated(msg)
            msg.ack.assert_called_once()

    @pytest.mark.asyncio
    async def test_no_brain_state(self):
        msg = _make_msg({"learnerId": str(uuid.uuid4())})
        with patch("brain_svc.events.subscribers.get_session") as mock_gs:
            mock_session = AsyncMock()
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.services.brain_state.get_brain_state", return_value=None):
                await _on_tutor_addon_activated(msg)
            msg.ack.assert_called_once()

    @pytest.mark.asyncio
    async def test_error_naks(self):
        msg = _make_msg({"learnerId": str(uuid.uuid4())})
        with patch("brain_svc.events.subscribers.get_session", side_effect=Exception("fail")):
            await _on_tutor_addon_activated(msg)
        msg.nak.assert_called_once()


class TestOnTutorAddonDeactivated:
    @pytest.mark.asyncio
    async def test_success(self):
        data = {"learnerId": str(uuid.uuid4()), "tutorId": "tutor-1"}
        msg = _make_msg(data)
        fake_bs = MagicMock()

        with patch("brain_svc.events.subscribers.get_session") as mock_gs:
            mock_session = AsyncMock()
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.services.brain_state.get_brain_state", return_value=fake_bs), \
                 patch("brain_svc.services.tutor_registry.deactivate_tutor", new_callable=AsyncMock):
                await _on_tutor_addon_deactivated(msg)
            msg.ack.assert_called_once()

    @pytest.mark.asyncio
    async def test_no_brain_state(self):
        msg = _make_msg({"learnerId": str(uuid.uuid4())})
        with patch("brain_svc.events.subscribers.get_session") as mock_gs:
            mock_session = AsyncMock()
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.services.brain_state.get_brain_state", return_value=None):
                await _on_tutor_addon_deactivated(msg)
            msg.ack.assert_called_once()

    @pytest.mark.asyncio
    async def test_error_naks(self):
        msg = _make_msg({"learnerId": str(uuid.uuid4())})
        with patch("brain_svc.events.subscribers.get_session", side_effect=Exception("fail")):
            await _on_tutor_addon_deactivated(msg)
        msg.nak.assert_called_once()


class TestOnIepConfirmed:
    @pytest.mark.asyncio
    async def test_success(self):
        data = {
            "learnerId": str(uuid.uuid4()),
            "documentId": str(uuid.uuid4()),
            "confirmedBy": str(uuid.uuid4()),
            "iepProfile": {"goals": ["read better"]},
        }
        msg = _make_msg(data)
        fake_bs = MagicMock()

        with patch("brain_svc.events.subscribers.get_session") as mock_gs:
            mock_session = AsyncMock()
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.services.brain_state.get_brain_state", return_value=fake_bs), \
                 patch("brain_svc.services.brain_state.update_brain_state", new_callable=AsyncMock):
                await _on_iep_confirmed(msg)
            msg.ack.assert_called_once()

    @pytest.mark.asyncio
    async def test_no_brain_state(self):
        msg = _make_msg({"learnerId": str(uuid.uuid4())})
        with patch("brain_svc.events.subscribers.get_session") as mock_gs:
            mock_session = AsyncMock()
            mock_gs.return_value.__aenter__ = AsyncMock(return_value=mock_session)
            mock_gs.return_value.__aexit__ = AsyncMock(return_value=False)
            with patch("brain_svc.services.brain_state.get_brain_state", return_value=None):
                await _on_iep_confirmed(msg)
            msg.ack.assert_called_once()

    @pytest.mark.asyncio
    async def test_error_naks(self):
        msg = _make_msg({"learnerId": str(uuid.uuid4())})
        with patch("brain_svc.events.subscribers.get_session", side_effect=Exception("fail")):
            await _on_iep_confirmed(msg)
        msg.nak.assert_called_once()
