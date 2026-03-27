"""Versioning service — snapshot creation and rollback."""

from __future__ import annotations

import copy
import logging
import uuid
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.models.brain_state import BrainState
from brain_svc.models.snapshot import BrainStateSnapshot
from brain_svc.services.brain_state import update_brain_state

logger = logging.getLogger(__name__)


async def create_snapshot(
    session: AsyncSession,
    brain_state: BrainState,
    trigger: str,
    trigger_metadata: dict[str, Any] | None = None,
) -> BrainStateSnapshot:
    """Create a point-in-time snapshot of a brain state."""
    # Get next version number
    result = await session.execute(
        select(func.coalesce(func.max(BrainStateSnapshot.version_number), 0))
        .where(BrainStateSnapshot.brain_state_id == brain_state.id)
    )
    current_max = result.scalar() or 0
    next_version = current_max + 1

    snapshot = BrainStateSnapshot(
        brain_state_id=brain_state.id,
        snapshot={
            "state": copy.deepcopy(brain_state.state),
            "functioning_level_profile": copy.deepcopy(brain_state.functioning_level_profile),
            "iep_profile": copy.deepcopy(brain_state.iep_profile),
            "delivery_levels": copy.deepcopy(brain_state.delivery_levels),
            "active_tutors": copy.deepcopy(brain_state.active_tutors),
            "preferred_modality": brain_state.preferred_modality,
            "attention_span_minutes": brain_state.attention_span_minutes,
            "cognitive_load": brain_state.cognitive_load,
        },
        trigger=trigger,
        trigger_metadata=trigger_metadata or {},
        version_number=next_version,
    )
    session.add(snapshot)
    await session.flush()
    logger.info(
        "Snapshot v%d created for brain %s (trigger: %s)",
        next_version, brain_state.id, trigger,
    )
    return snapshot


async def list_snapshots(
    session: AsyncSession,
    brain_state_id: str,
    limit: int = 50,
) -> list[BrainStateSnapshot]:
    """List snapshots for a brain state, newest first."""
    result = await session.execute(
        select(BrainStateSnapshot)
        .where(BrainStateSnapshot.brain_state_id == uuid.UUID(brain_state_id))
        .order_by(BrainStateSnapshot.version_number.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_snapshot(
    session: AsyncSession,
    snapshot_id: str,
) -> BrainStateSnapshot | None:
    """Retrieve a specific snapshot."""
    result = await session.execute(
        select(BrainStateSnapshot).where(BrainStateSnapshot.id == uuid.UUID(snapshot_id))
    )
    return result.scalar_one_or_none()


async def rollback_to_snapshot(
    session: AsyncSession,
    brain_state: BrainState,
    snapshot: BrainStateSnapshot,
) -> BrainState:
    """Restore a brain state from a snapshot."""
    data = snapshot.snapshot
    updates: dict[str, Any] = {}

    if "state" in data:
        updates["state"] = data["state"]
    if "functioning_level_profile" in data:
        updates["functioning_level_profile"] = data["functioning_level_profile"]
    if "iep_profile" in data:
        updates["iep_profile"] = data["iep_profile"]
    if "delivery_levels" in data:
        updates["delivery_levels"] = data["delivery_levels"]
    if "active_tutors" in data:
        updates["active_tutors"] = data["active_tutors"]
    if "preferred_modality" in data:
        updates["preferred_modality"] = data["preferred_modality"]
    if "attention_span_minutes" in data:
        updates["attention_span_minutes"] = data["attention_span_minutes"]
    if "cognitive_load" in data:
        updates["cognitive_load"] = data["cognitive_load"]

    brain_state = await update_brain_state(session, brain_state, updates)

    # Create a ROLLBACK snapshot to record the action
    await create_snapshot(
        session, brain_state, "ROLLBACK",
        {"rolled_back_to_version": snapshot.version_number},
    )

    logger.info(
        "Brain %s rolled back to snapshot v%d",
        brain_state.id, snapshot.version_number,
    )
    return brain_state
