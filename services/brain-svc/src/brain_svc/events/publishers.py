"""Event publishers — emit brain events to NATS JetStream."""

from __future__ import annotations

import logging
from typing import Any

from brain_svc.nats_client import publish_event

logger = logging.getLogger(__name__)


async def publish_brain_cloned(
    learner_id: str,
    brain_state_id: str,
    main_brain_version: str,
    functioning_level: str,
) -> None:
    await publish_event("aivo.brain.cloned", {
        "learnerId": learner_id,
        "brainStateId": brain_state_id,
        "mainBrainVersion": main_brain_version,
        "functioningLevel": functioning_level,
    })


async def publish_brain_updated(
    learner_id: str,
    brain_state_id: str,
    changes: dict[str, Any],
) -> None:
    await publish_event("aivo.brain.updated", {
        "learnerId": learner_id,
        "brainStateId": brain_state_id,
        "changes": changes,
    })


async def publish_snapshot_created(
    brain_state_id: str,
    snapshot_id: str,
    trigger: str,
    version_number: int,
) -> None:
    await publish_event("aivo.brain.snapshot.created", {
        "brainStateId": brain_state_id,
        "snapshotId": snapshot_id,
        "trigger": trigger,
        "versionNumber": version_number,
    })


async def publish_mastery_updated(
    learner_id: str,
    skill: str,
    previous_level: float,
    new_level: float,
    delta: float,
) -> None:
    await publish_event("aivo.brain.mastery.updated", {
        "learnerId": learner_id,
        "skill": skill,
        "previousLevel": previous_level,
        "newLevel": new_level,
        "delta": delta,
    })


async def publish_recommendation_created(
    learner_id: str,
    recommendation_id: str,
    rec_type: str,
    title: str,
) -> None:
    await publish_event("aivo.brain.recommendation.created", {
        "learnerId": learner_id,
        "recommendationId": recommendation_id,
        "type": rec_type,
        "title": title,
    })


async def publish_recommendation_responded(
    learner_id: str,
    recommendation_id: str,
    status: str,
    responded_by: str,
) -> None:
    await publish_event("aivo.brain.recommendation.responded", {
        "learnerId": learner_id,
        "recommendationId": recommendation_id,
        "status": status,
        "respondedBy": responded_by,
    })


async def publish_iep_goal_met(
    learner_id: str,
    goal_id: str,
    domain: str,
) -> None:
    await publish_event("aivo.brain.iep_goal.met", {
        "learnerId": learner_id,
        "goalId": goal_id,
        "domain": domain,
    })


async def publish_functioning_level_changed(
    learner_id: str,
    previous_level: str,
    new_level: str,
    reason: str,
) -> None:
    await publish_event("aivo.brain.functioning_level.changed", {
        "learnerId": learner_id,
        "previousLevel": previous_level,
        "newLevel": new_level,
        "reason": reason,
    })


async def publish_regression_detected(
    learner_id: str,
    regressions: list[dict[str, Any]],
) -> None:
    await publish_event("aivo.brain.regression.detected", {
        "learnerId": learner_id,
        "regressions": regressions,
    })


async def publish_brain_upgraded(
    learner_id: str,
    brain_state_id: str,
    previous_version: str,
    new_version: str,
) -> None:
    await publish_event("aivo.brain.upgraded", {
        "learnerId": learner_id,
        "brainStateId": brain_state_id,
        "previousVersion": previous_version,
        "newVersion": new_version,
    })


async def publish_upgrade_batch_completed(
    version: str,
    total_upgraded: int,
    total_failed: int,
    duration_ms: int,
) -> None:
    await publish_event("aivo.brain.upgrade.batch.completed", {
        "version": version,
        "totalUpgraded": total_upgraded,
        "totalFailed": total_failed,
        "durationMs": duration_ms,
    })


async def publish_snapshot_restored(
    learner_id: str,
    snapshot_id: str,
    restored_by: str,
) -> None:
    await publish_event("aivo.brain.snapshot.restored", {
        "learnerId": learner_id,
        "snapshotId": snapshot_id,
        "restoredBy": restored_by,
    })
