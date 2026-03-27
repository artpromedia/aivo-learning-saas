"""Brain clone pipeline — full clone from seed to learner Brain (Section 4.3)."""

from __future__ import annotations

import copy
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.ml.base_brain_model import BaseBrainModel
from brain_svc.ml.mastery_engine import MasteryEngine, SkillMastery
from brain_svc.ml.model_store import ModelStore
from brain_svc.models.brain_state import BrainState
from brain_svc.models.episode import BrainEpisode
from brain_svc.models.snapshot import BrainStateSnapshot
from brain_svc.services.accommodation import resolve_accommodations
from brain_svc.services.main_brain import (
    ACCOMMODATION_DEFAULTS,
    get_latest_seed,
    resolve_seed_for_learner,
)

logger = logging.getLogger(__name__)


async def clone_brain(
    session: AsyncSession,
    model_store: ModelStore,
    learner_id: str,
    assessment_id: str,
    domains: dict[str, float],
    functioning_level: str,
    enrolled_grade: int,
    iep_profile: dict[str, Any] | None = None,
    disability_signals: dict[str, Any] | None = None,
    iep_accommodations: list[str] | None = None,
    iep_goals: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Execute the full Brain clone pipeline.

    Steps:
      1. SELECT seed template
      2. Deep copy seed_state
      3. Inject domain scores into mastery_levels
      4. Inject disability signals
      5. Inject functioning_level_profile
      6. Inject iep_profile
      7. Resolve accommodations
      8. Map IEP goals to curriculum targets
      9. Initialize functional_curriculum if LOW_VERBAL or below
      10. Save initial snapshot (INITIAL_CLONE)
      11. INSERT brain_states
      12. Clone PyTorch BKT model
      13. Seed Redis episodic namespace
    """
    learner_uuid = uuid.UUID(learner_id)

    # Step 1: Select seed
    resolved_seed = resolve_seed_for_learner(enrolled_grade, functioning_level)
    main_brain_version = resolved_seed["version"]
    logger.info("Cloning brain for learner %s from seed %s", learner_id, main_brain_version)

    # Step 2: Deep copy seed state
    state: dict[str, Any] = {
        "mastery_levels": {},
        "domain_scores": {},
        "active_accommodations": [],
        "curriculum_alignment": resolved_seed.get("active_curriculum", []),
        "disability_signals": {},
    }

    # Step 3: Inject domain scores
    mastery_template = resolved_seed.get("mastery_template", {})
    for domain, score in domains.items():
        state["domain_scores"][domain] = score
        state["mastery_levels"][domain] = max(score, mastery_template.get(domain, 0.1))

    # Step 4: Inject disability signals
    if disability_signals:
        state["disability_signals"] = disability_signals

    # Step 5: Functioning level profile
    fl_profile = _build_functioning_level_profile(functioning_level)

    # Step 6: IEP profile
    iep_data = iep_profile or {}

    # Step 7: Resolve accommodations
    assessment_accommodations = _derive_accommodations_from_signals(
        disability_signals or {}, functioning_level
    )
    all_accommodation_sources = {
        "assessment": assessment_accommodations,
        "iep": iep_accommodations or [],
        "functioning_level_defaults": ACCOMMODATION_DEFAULTS.get(functioning_level, []),
    }
    active_accommodations = resolve_accommodations(all_accommodation_sources)
    state["active_accommodations"] = active_accommodations

    # Step 8: Map IEP goals
    if iep_goals:
        state["iep_goal_targets"] = [
            {"goal_id": g.get("id"), "domain": g.get("domain"), "target": g.get("target_metric")}
            for g in iep_goals
        ]

    # Step 9: Functional curriculum init
    needs_functional = functioning_level in ("LOW_VERBAL", "NON_VERBAL", "PRE_SYMBOLIC")
    if needs_functional:
        state["functional_curriculum_active"] = True
        state["functional_domains"] = [
            "COMMUNICATION", "SELF_CARE", "SOCIAL_EMOTIONAL", "PRE_ACADEMIC", "MOTOR_SENSORY"
        ]

    # Delivery levels
    delivery_levels = resolved_seed.get("active_delivery_levels", {})

    # Attention span and cognitive load defaults by FL
    attention_defaults = {
        "STANDARD": (45, "MEDIUM"),
        "SUPPORTED": (30, "MEDIUM"),
        "LOW_VERBAL": (20, "LOW"),
        "NON_VERBAL": (15, "LOW"),
        "PRE_SYMBOLIC": (10, "LOW"),
    }
    attention_span, cognitive_load = attention_defaults.get(functioning_level, (30, "MEDIUM"))

    # Step 11: INSERT brain_states
    brain_state = BrainState(
        learner_id=learner_uuid,
        main_brain_version=main_brain_version,
        seed_version=main_brain_version,
        state=state,
        functioning_level_profile=fl_profile,
        iep_profile=iep_data,
        active_tutors=[],
        delivery_levels=delivery_levels,
        attention_span_minutes=attention_span,
        cognitive_load=cognitive_load,
    )
    session.add(brain_state)
    await session.flush()

    # Step 10: Save initial snapshot
    snapshot = BrainStateSnapshot(
        brain_state_id=brain_state.id,
        snapshot={
            "state": copy.deepcopy(state),
            "functioning_level_profile": copy.deepcopy(fl_profile),
            "iep_profile": copy.deepcopy(iep_data),
            "delivery_levels": copy.deepcopy(delivery_levels),
        },
        trigger="INITIAL_CLONE",
        trigger_metadata={"assessment_id": assessment_id},
        version_number=1,
    )
    session.add(snapshot)

    # Step 13: Log BRAIN_CLONED episode
    episode = BrainEpisode(
        brain_state_id=brain_state.id,
        event_type="BRAIN_CLONED",
        payload={
            "assessment_id": assessment_id,
            "main_brain_version": main_brain_version,
            "functioning_level": functioning_level,
            "domains": domains,
        },
    )
    session.add(episode)

    # Step 12: Clone PyTorch model
    seed_model = BaseBrainModel()
    seed_engine = MasteryEngine(seed_model)
    model_store.clone_seed(learner_id, seed_engine)

    await session.flush()

    logger.info(
        "Brain cloned for learner %s: brain_state_id=%s, version=%s",
        learner_id, brain_state.id, main_brain_version,
    )

    return {
        "brain_state_id": str(brain_state.id),
        "learner_id": learner_id,
        "main_brain_version": main_brain_version,
        "functioning_level": functioning_level,
        "snapshot_id": str(snapshot.id),
    }


def _build_functioning_level_profile(functioning_level: str) -> dict[str, Any]:
    """Build the functioning level profile for a learner."""
    profiles = {
        "STANDARD": {
            "level": "STANDARD",
            "communication_mode": "VERBAL",
            "interaction_mode": "INDEPENDENT",
            "response_type": "TEXT_AND_TOUCH",
            "attention_span": "FULL",
            "session_duration_limit": 45,
        },
        "SUPPORTED": {
            "level": "SUPPORTED",
            "communication_mode": "VERBAL",
            "interaction_mode": "GUIDED",
            "response_type": "TOUCH_AND_VOICE",
            "attention_span": "MODERATE",
            "session_duration_limit": 30,
        },
        "LOW_VERBAL": {
            "level": "LOW_VERBAL",
            "communication_mode": "LIMITED_VERBAL",
            "interaction_mode": "SUPPORTED",
            "response_type": "TOUCH_ONLY",
            "attention_span": "SHORT",
            "session_duration_limit": 20,
        },
        "NON_VERBAL": {
            "level": "NON_VERBAL",
            "communication_mode": "NON_VERBAL_AAC",
            "interaction_mode": "ASSISTED",
            "response_type": "SWITCH_OR_TOUCH",
            "attention_span": "BRIEF",
            "session_duration_limit": 15,
        },
        "PRE_SYMBOLIC": {
            "level": "PRE_SYMBOLIC",
            "communication_mode": "PRE_INTENTIONAL",
            "interaction_mode": "PARTNER_DIRECTED",
            "response_type": "PARTNER_INTERPRETED",
            "attention_span": "MINIMAL",
            "session_duration_limit": 10,
        },
    }
    return profiles.get(functioning_level, profiles["STANDARD"])


def _derive_accommodations_from_signals(
    disability_signals: dict[str, Any],
    functioning_level: str,
) -> list[str]:
    """Derive accommodations from assessment disability signals."""
    accommodations: list[str] = []
    if disability_signals.get("needs_extended_time"):
        accommodations.append("extended_time")
    if disability_signals.get("needs_tts"):
        accommodations.append("text_to_speech")
    if disability_signals.get("needs_audio"):
        accommodations.append("audio_narration")
    if disability_signals.get("needs_pictures"):
        accommodations.append("picture_support")
    if disability_signals.get("needs_reduced_choices"):
        accommodations.append("reduced_choices")
    if disability_signals.get("needs_large_targets"):
        accommodations.append("large_touch_targets")
    if disability_signals.get("needs_breaks"):
        accommodations.append("sensory_breaks")
    return accommodations
