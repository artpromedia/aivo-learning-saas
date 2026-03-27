"""Mastery service — orchestrates mastery updates after learning interactions."""

from __future__ import annotations

import logging
import time
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.ml.mastery_engine import MasteryEngine, MasteryUpdate, SkillMastery
from brain_svc.ml.model_store import ModelStore
from brain_svc.models.brain_state import BrainState
from brain_svc.models.episode import BrainEpisode
from brain_svc.services.brain_state import update_brain_state

logger = logging.getLogger(__name__)

REGRESSION_THRESHOLD = 0.15
REGRESSION_WINDOW_DAYS = 14


def _state_to_skill_masteries(state: dict[str, Any]) -> dict[str, SkillMastery]:
    """Convert JSONB mastery_levels to SkillMastery objects."""
    mastery_levels = state.get("mastery_levels", {})
    result: dict[str, SkillMastery] = {}
    for skill, data in mastery_levels.items():
        if isinstance(data, dict):
            result[skill] = SkillMastery(
                skill_id=skill,
                p_known=data.get("p_known", 0.1),
                attempts=data.get("attempts", 0),
                correct_count=data.get("correct_count", 0),
                last_interaction_ts=data.get("last_interaction_ts", 0.0),
                review_interval_days=data.get("review_interval_days", 1.0),
                next_review_ts=data.get("next_review_ts", 0.0),
            )
        elif isinstance(data, (int, float)):
            result[skill] = SkillMastery(skill_id=skill, p_known=float(data))
    return result


def _skill_masteries_to_state(masteries: dict[str, SkillMastery]) -> dict[str, Any]:
    """Convert SkillMastery objects back to JSONB-safe dicts."""
    return {
        skill: {
            "p_known": sm.p_known,
            "attempts": sm.attempts,
            "correct_count": sm.correct_count,
            "last_interaction_ts": sm.last_interaction_ts,
            "review_interval_days": sm.review_interval_days,
            "next_review_ts": sm.next_review_ts,
        }
        for skill, sm in masteries.items()
    }


async def process_mastery_update(
    session: AsyncSession,
    model_store: ModelStore,
    brain_state: BrainState,
    skill: str,
    is_correct: bool,
    difficulty: float = 0.5,
    session_id: str | None = None,
) -> MasteryUpdate:
    """Process a single mastery update for a brain state."""
    learner_id = str(brain_state.learner_id)
    fl = (brain_state.functioning_level_profile or {}).get("level", "STANDARD")
    now = time.time()

    # Load engine
    engine = model_store.load(learner_id)
    if engine is None:
        from brain_svc.ml.base_brain_model import BaseBrainModel
        engine = MasteryEngine(BaseBrainModel())

    # Convert state
    state = dict(brain_state.state) if brain_state.state else {}
    skill_masteries = _state_to_skill_masteries(state)

    # Update
    update = engine.update_mastery(
        mastery_levels=skill_masteries,
        skill=skill,
        is_correct=is_correct,
        difficulty=difficulty,
        functioning_level=fl,
        timestamp=now,
    )

    # Persist model
    model_store.save(learner_id, engine)

    # Update state
    state["mastery_levels"] = _skill_masteries_to_state(skill_masteries)
    await update_brain_state(session, brain_state, {"state": state})

    # Log episode
    episode = BrainEpisode(
        brain_state_id=brain_state.id,
        event_type="MASTERY_UPDATE",
        payload={
            "skill": skill,
            "is_correct": is_correct,
            "difficulty": difficulty,
            "previous_level": update.previous_level,
            "new_level": update.new_level,
            "delta": update.delta,
        },
        session_id=session_id,
    )
    session.add(episode)

    return update


async def process_batch_mastery_update(
    session: AsyncSession,
    model_store: ModelStore,
    brain_state: BrainState,
    interactions: list[dict[str, Any]],
    session_id: str | None = None,
) -> list[MasteryUpdate]:
    """Process multiple mastery updates from a session."""
    learner_id = str(brain_state.learner_id)
    fl = (brain_state.functioning_level_profile or {}).get("level", "STANDARD")

    engine = model_store.load(learner_id)
    if engine is None:
        from brain_svc.ml.base_brain_model import BaseBrainModel
        engine = MasteryEngine(BaseBrainModel())

    state = dict(brain_state.state) if brain_state.state else {}
    skill_masteries = _state_to_skill_masteries(state)

    updates = engine.batch_update(
        mastery_levels=skill_masteries,
        interactions=interactions,
        functioning_level=fl,
    )

    model_store.save(learner_id, engine)

    state["mastery_levels"] = _skill_masteries_to_state(skill_masteries)
    await update_brain_state(session, brain_state, {"state": state})

    episode = BrainEpisode(
        brain_state_id=brain_state.id,
        event_type="BATCH_MASTERY_UPDATE",
        payload={
            "count": len(updates),
            "skills": [u.skill for u in updates],
            "session_id": session_id,
        },
        session_id=session_id,
    )
    session.add(episode)

    return updates


def detect_regression(
    current_levels: dict[str, Any],
    previous_levels: dict[str, Any],
) -> list[dict[str, Any]]:
    """Detect mastery regression ≥15% drop over 14-day window."""
    regressions: list[dict[str, Any]] = []
    for skill, current in current_levels.items():
        current_p = current.get("p_known", 0.0) if isinstance(current, dict) else float(current)
        prev = previous_levels.get(skill)
        if prev is None:
            continue
        prev_p = prev.get("p_known", 0.0) if isinstance(prev, dict) else float(prev)
        drop = prev_p - current_p
        if drop >= REGRESSION_THRESHOLD:
            regressions.append({
                "skill": skill,
                "previous_level": prev_p,
                "current_level": current_p,
                "drop": drop,
            })
    return regressions
