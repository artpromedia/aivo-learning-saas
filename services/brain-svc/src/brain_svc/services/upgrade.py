"""Upgrade service — batch upgrade all brain states to a new Main Brain version."""

from __future__ import annotations

import copy
import logging
import time
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.models.brain_state import BrainState
from brain_svc.services.brain_state import update_brain_state
from brain_svc.services.main_brain import get_seed, build_default_seed, register_seed
from brain_svc.services.versioning import create_snapshot
from brain_svc.events.publishers import publish_brain_upgraded, publish_upgrade_batch_completed

logger = logging.getLogger(__name__)

BATCH_SIZE = 100


async def upgrade_all_brains(
    session: AsyncSession,
    new_version: str,
    dry_run: bool = False,
) -> dict[str, Any]:
    """Upgrade all brain states to a new Main Brain version.

    - Paginates through brain_states in batches of 100
    - Skips brains already at new_version (idempotent)
    - For each brain: snapshot (trigger=MAIN_BRAIN_UPGRADE), then apply new seed
      while preserving learner-specific state (mastery_levels, iep_profile, episodic_memory)
    - Returns stats dict with upgrade_count, fail_count, duration_ms
    """
    start_time = time.monotonic()
    upgrade_count = 0
    fail_count = 0
    skipped_count = 0

    # Ensure the seed version exists in the registry
    seed = get_seed(new_version)
    if seed is None:
        seed = build_default_seed(new_version)
        register_seed(seed)

    # Count total brains to process
    total_result = await session.execute(
        select(func.count(BrainState.id))
    )
    total_brains = total_result.scalar() or 0

    offset = 0
    while offset < total_brains:
        result = await session.execute(
            select(BrainState)
            .order_by(BrainState.id)
            .offset(offset)
            .limit(BATCH_SIZE)
        )
        batch = list(result.scalars().all())
        if not batch:
            break

        for brain_state in batch:
            try:
                # Skip brains already at new_version (idempotent)
                if brain_state.main_brain_version == new_version:
                    skipped_count += 1
                    continue

                if dry_run:
                    upgrade_count += 1
                    continue

                previous_version = brain_state.main_brain_version or ""

                # Create pre-upgrade snapshot
                await create_snapshot(
                    session=session,
                    brain_state=brain_state,
                    trigger="MAIN_BRAIN_UPGRADE",
                    trigger_metadata={
                        "previous_version": previous_version,
                        "new_version": new_version,
                    },
                )

                # Apply new seed improvements while preserving learner-specific state
                current_state = copy.deepcopy(brain_state.state) if brain_state.state else {}

                # Preserve learner-specific data
                preserved_mastery = current_state.get("mastery_levels", {})
                preserved_episodic = current_state.get("episodic_memory", [])
                preserved_domain_scores = current_state.get("domain_scores", {})
                preserved_accommodations = current_state.get("active_accommodations", [])

                # Build new state from seed
                new_state = copy.deepcopy(current_state)

                # Apply seed improvements (new curriculum alignment, updated defaults)
                if "mastery_template" in seed:
                    # Add any new domains from seed that don't exist yet
                    for domain, default_val in seed["mastery_template"].items():
                        if domain not in preserved_mastery:
                            preserved_mastery[domain] = default_val
                new_state["mastery_levels"] = preserved_mastery

                # Restore other preserved data
                new_state["episodic_memory"] = preserved_episodic
                new_state["domain_scores"] = preserved_domain_scores
                new_state["active_accommodations"] = preserved_accommodations

                # Update curriculum alignment from new seed
                if "curriculum_alignment" in seed:
                    new_state["curriculum_alignment"] = seed["curriculum_alignment"]

                updates: dict[str, Any] = {
                    "main_brain_version": new_version,
                    "seed_version": new_version,
                    "state": new_state,
                }

                # Update delivery levels from seed if applicable
                if "delivery_levels" in seed and brain_state.delivery_levels:
                    # Merge: keep existing learner-specific delivery levels,
                    # add any new keys from the seed
                    merged_delivery = copy.deepcopy(brain_state.delivery_levels)
                    for key, val in seed["delivery_levels"].items():
                        if key not in merged_delivery:
                            merged_delivery[key] = val
                    updates["delivery_levels"] = merged_delivery

                await update_brain_state(session, brain_state, updates)

                await publish_brain_upgraded(
                    learner_id=str(brain_state.learner_id),
                    brain_state_id=str(brain_state.id),
                    previous_version=previous_version,
                    new_version=new_version,
                )

                upgrade_count += 1

            except Exception:
                logger.exception(
                    "Failed to upgrade brain %s for learner %s",
                    brain_state.id, brain_state.learner_id,
                )
                fail_count += 1

        offset += BATCH_SIZE

    duration_ms = int((time.monotonic() - start_time) * 1000)

    stats = {
        "version": new_version,
        "total_upgraded": upgrade_count,
        "total_failed": fail_count,
        "total_skipped": skipped_count,
        "total_brains": total_brains,
        "duration_ms": duration_ms,
        "dry_run": dry_run,
    }

    if not dry_run:
        await publish_upgrade_batch_completed(
            version=new_version,
            total_upgraded=upgrade_count,
            total_failed=fail_count,
            duration_ms=duration_ms,
        )

    logger.info(
        "Brain upgrade %s: upgraded=%d failed=%d skipped=%d duration=%dms",
        "dry-run" if dry_run else "complete",
        upgrade_count, fail_count, skipped_count, duration_ms,
    )

    return stats
