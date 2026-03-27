"""Event subscribers — listen for NATS JetStream events and trigger brain logic."""

from __future__ import annotations

import json
import logging
from typing import Any

from nats.aio.msg import Msg

from brain_svc.config import get_settings
from brain_svc.db import get_session
from brain_svc.events.publishers import (
    publish_brain_cloned,
    publish_mastery_updated,
)
from brain_svc.ml.model_store import ModelStore
from brain_svc.nats_client import get_jetstream

logger = logging.getLogger(__name__)

_model_store: ModelStore | None = None


def _get_model_store() -> ModelStore:
    global _model_store
    if _model_store is None:
        _model_store = ModelStore(get_settings().model_store_dir)
    return _model_store


async def setup_subscriptions() -> None:
    """Set up all NATS JetStream subscriptions."""
    js = await get_jetstream()

    # Ensure stream exists
    try:
        await js.find_stream_name_by_subject("aivo.brain.*")
    except Exception:
        await js.add_stream(
            name="AIVO_BRAIN",
            subjects=[
                "aivo.brain.*",
                "aivo.assessment.*",
                "aivo.lesson.*",
                "aivo.quiz.*",
                "aivo.tutor.*",
                "aivo.homework.*",
            ],
            max_age=365 * 24 * 60 * 60 * 10**9,  # 365 days in nanoseconds
            max_bytes=50 * 1024**3,  # 50GB
        )

    # Subscribe to assessment baseline completed
    await js.subscribe(
        "aivo.assessment.baseline.completed",
        cb=_on_assessment_baseline_completed,
        durable="brain-svc-assessment-baseline",
        manual_ack=True,
    )

    # Subscribe to lesson completed
    await js.subscribe(
        "aivo.lesson.completed",
        cb=_on_lesson_completed,
        durable="brain-svc-lesson-completed",
        manual_ack=True,
    )

    # Subscribe to quiz completed
    await js.subscribe(
        "aivo.quiz.completed",
        cb=_on_quiz_completed,
        durable="brain-svc-quiz-completed",
        manual_ack=True,
    )

    # Subscribe to tutor session completed
    await js.subscribe(
        "aivo.tutor.session.completed",
        cb=_on_tutor_session_completed,
        durable="brain-svc-tutor-session",
        manual_ack=True,
    )

    # Subscribe to homework session completed
    await js.subscribe(
        "aivo.homework.session.completed",
        cb=_on_homework_session_completed,
        durable="brain-svc-homework-session",
        manual_ack=True,
    )

    # Subscribe to tutor addon activated
    await js.subscribe(
        "aivo.tutor.addon.activated",
        cb=_on_tutor_addon_activated,
        durable="brain-svc-tutor-addon-activated",
        manual_ack=True,
    )

    # Subscribe to tutor addon deactivated
    await js.subscribe(
        "aivo.tutor.addon.deactivated",
        cb=_on_tutor_addon_deactivated,
        durable="brain-svc-tutor-addon-deactivated",
        manual_ack=True,
    )

    # Subscribe to IEP confirmed
    await js.subscribe(
        "aivo.assessment.iep.confirmed",
        cb=_on_iep_confirmed,
        durable="brain-svc-iep-confirmed",
        manual_ack=True,
    )

    logger.info("All NATS subscriptions established")


def _parse_msg(msg: Msg) -> dict[str, Any]:
    """Parse message payload as JSON."""
    return json.loads(msg.data.decode())


async def _on_assessment_baseline_completed(msg: Msg) -> None:
    """Handle assessment.baseline.completed — trigger Brain clone."""
    try:
        data = _parse_msg(msg)
        logger.info("Received assessment.baseline.completed for learner %s", data.get("learnerId"))

        from brain_svc.services.brain_clone import clone_brain

        model_store = _get_model_store()
        async with get_session() as session:
            result = await clone_brain(
                session=session,
                model_store=model_store,
                learner_id=data["learnerId"],
                assessment_id=data["assessmentId"],
                domains=data.get("domains", {}),
                functioning_level=data.get("functioningLevel", "STANDARD"),
                enrolled_grade=data.get("enrolledGrade", 3),
                iep_profile=data.get("iepProfile"),
                disability_signals=data.get("disabilitySignals"),
                iep_accommodations=data.get("iepAccommodations"),
                iep_goals=data.get("iepGoals"),
            )

        await publish_brain_cloned(
            learner_id=data["learnerId"],
            brain_state_id=result["brain_state_id"],
            main_brain_version=result["main_brain_version"],
            functioning_level=result["functioning_level"],
        )
        await msg.ack()
    except Exception:
        logger.exception("Error processing assessment.baseline.completed")
        await msg.nak()


async def _on_lesson_completed(msg: Msg) -> None:
    """Handle lesson.completed — update mastery."""
    await _process_learning_event(msg, "lesson")


async def _on_quiz_completed(msg: Msg) -> None:
    """Handle quiz.completed — update mastery."""
    await _process_learning_event(msg, "quiz")


async def _on_tutor_session_completed(msg: Msg) -> None:
    """Handle tutor.session.completed — update mastery."""
    await _process_learning_event(msg, "tutor_session")


async def _on_homework_session_completed(msg: Msg) -> None:
    """Handle homework.session.completed — update mastery."""
    await _process_learning_event(msg, "homework")


async def _process_learning_event(msg: Msg, source: str) -> None:
    """Generic handler for learning-related events that affect mastery."""
    try:
        data = _parse_msg(msg)
        learner_id = data.get("learnerId")
        logger.info("Received %s.completed for learner %s", source, learner_id)

        from brain_svc.services.brain_state import get_brain_state
        from brain_svc.services.mastery import process_mastery_update

        model_store = _get_model_store()
        async with get_session() as session:
            bs = await get_brain_state(session, learner_id)
            if not bs:
                logger.warning("No brain state found for learner %s, skipping", learner_id)
                await msg.ack()
                return

            skill = data.get("skill", data.get("subject", "unknown"))
            is_correct = data.get("masteryDelta", 0) > 0
            difficulty = data.get("difficulty", 0.5)
            session_id = data.get("sessionId")

            result = await process_mastery_update(
                session=session,
                model_store=model_store,
                brain_state=bs,
                skill=skill,
                is_correct=is_correct,
                difficulty=difficulty,
                session_id=session_id,
            )

            await publish_mastery_updated(
                learner_id=learner_id,
                skill=result.skill,
                previous_level=result.previous_level,
                new_level=result.new_level,
                delta=result.delta,
            )

        await msg.ack()
    except Exception:
        logger.exception("Error processing %s.completed", source)
        await msg.nak()


async def _on_tutor_addon_activated(msg: Msg) -> None:
    """Handle tutor.addon.activated — add tutor to active list."""
    try:
        data = _parse_msg(msg)
        learner_id = data.get("learnerId")

        from brain_svc.services.brain_state import get_brain_state
        from brain_svc.services.tutor_registry import activate_tutor

        async with get_session() as session:
            bs = await get_brain_state(session, learner_id)
            if bs:
                await activate_tutor(
                    session=session,
                    brain_state=bs,
                    tutor_id=data.get("tutorId", ""),
                    tutor_type=data.get("tutorType", "ADDON"),
                    subject=data.get("subject"),
                )
        await msg.ack()
    except Exception:
        logger.exception("Error processing tutor.addon.activated")
        await msg.nak()


async def _on_tutor_addon_deactivated(msg: Msg) -> None:
    """Handle tutor.addon.deactivated — remove tutor from active list."""
    try:
        data = _parse_msg(msg)
        learner_id = data.get("learnerId")

        from brain_svc.services.brain_state import get_brain_state
        from brain_svc.services.tutor_registry import deactivate_tutor

        async with get_session() as session:
            bs = await get_brain_state(session, learner_id)
            if bs:
                await deactivate_tutor(
                    session=session,
                    brain_state=bs,
                    tutor_id=data.get("tutorId", ""),
                )
        await msg.ack()
    except Exception:
        logger.exception("Error processing tutor.addon.deactivated")
        await msg.nak()


async def _on_iep_confirmed(msg: Msg) -> None:
    """Handle assessment.iep.confirmed — update brain IEP profile."""
    try:
        data = _parse_msg(msg)
        learner_id = data.get("learnerId")

        from brain_svc.services.brain_state import get_brain_state, update_brain_state

        async with get_session() as session:
            bs = await get_brain_state(session, learner_id)
            if bs:
                iep_data = data.get("iepProfile", {})
                await update_brain_state(session, bs, {"iep_profile": iep_data})
                logger.info("Updated IEP profile for learner %s", learner_id)
        await msg.ack()
    except Exception:
        logger.exception("Error processing assessment.iep.confirmed")
        await msg.nak()
