"""Regression detector — daily scan for post-upgrade mastery regressions."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.models.brain_state import BrainState
from brain_svc.models.snapshot import BrainStateSnapshot
from brain_svc.services.mastery import detect_regression
from brain_svc.services.recommendation import create_recommendation, can_re_trigger
from brain_svc.events.publishers import publish_recommendation_created

logger = logging.getLogger(__name__)

REGRESSION_THRESHOLD = 0.15
UPGRADE_WINDOW_DAYS = 14


async def detect_regressions(session: AsyncSession) -> list[dict[str, Any]]:
    """Run a daily regression scan on brains upgraded in the last 14 days.

    For each brain that was upgraded (has a MAIN_BRAIN_UPGRADE snapshot in
    the last 14 days):
      - Skip brand-new learners (created < 14 days ago)
      - Skip learners with no activity since upgrade (updated_at == snapshot time)
      - Compare snapshot mastery vs current mastery per domain
      - If any domain dropped >= 15%: create REGRESSION_ROLLBACK_OFFER recommendation

    Returns a list of detected regressions with learner and domain details.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=UPGRADE_WINDOW_DAYS)
    detected: list[dict[str, Any]] = []

    # Find all MAIN_BRAIN_UPGRADE snapshots created in the last 14 days
    snapshot_result = await session.execute(
        select(BrainStateSnapshot)
        .where(
            and_(
                BrainStateSnapshot.trigger == "MAIN_BRAIN_UPGRADE",
                BrainStateSnapshot.created_at >= cutoff,
            )
        )
        .order_by(BrainStateSnapshot.created_at.desc())
    )
    snapshots = list(snapshot_result.scalars().all())

    # Group by brain_state_id — take the latest snapshot per brain
    seen_brain_ids: set[str] = set()
    unique_snapshots: list[BrainStateSnapshot] = []
    for snap in snapshots:
        bs_id = str(snap.brain_state_id)
        if bs_id not in seen_brain_ids:
            seen_brain_ids.add(bs_id)
            unique_snapshots.append(snap)

    for snapshot in unique_snapshots:
        try:
            # Load the brain state
            bs_result = await session.execute(
                select(BrainState).where(BrainState.id == snapshot.brain_state_id)
            )
            brain_state = bs_result.scalar_one_or_none()
            if brain_state is None:
                continue

            # Skip brand-new learners (created < 14 days ago)
            if brain_state.created_at and brain_state.created_at >= cutoff:
                logger.debug(
                    "Skipping learner %s — brain created < 14 days ago",
                    brain_state.learner_id,
                )
                continue

            # Skip learners with no activity since upgrade
            # If updated_at is the same as the snapshot time (or earlier),
            # the learner has not had any interaction since upgrade
            if brain_state.updated_at and snapshot.created_at:
                # Allow a 1-second tolerance for the upgrade itself
                tolerance = timedelta(seconds=1)
                if brain_state.updated_at <= snapshot.created_at + tolerance:
                    logger.debug(
                        "Skipping learner %s — no activity since upgrade",
                        brain_state.learner_id,
                    )
                    continue

            # Get snapshot mastery and current mastery
            snapshot_state = snapshot.snapshot or {}
            snapshot_inner_state = snapshot_state.get("state", {})
            snapshot_mastery = snapshot_inner_state.get("mastery_levels", {})

            current_state = brain_state.state or {}
            current_mastery = current_state.get("mastery_levels", {})

            if not snapshot_mastery or not current_mastery:
                continue

            # Detect regressions (>= 15% drop)
            regressions = detect_regression(current_mastery, snapshot_mastery)

            if not regressions:
                continue

            learner_id = str(brain_state.learner_id)
            brain_state_id = str(brain_state.id)

            # Check re-trigger gap
            if not await can_re_trigger(session, learner_id, "REGRESSION_ROLLBACK_OFFER"):
                logger.debug(
                    "Skipping regression recommendation for learner %s — within re-trigger gap",
                    learner_id,
                )
                continue

            # Create recommendation
            domains_summary = ", ".join(r["skill"] for r in regressions)
            rec = await create_recommendation(
                session=session,
                brain_state_id=brain_state_id,
                learner_id=learner_id,
                rec_type="REGRESSION_ROLLBACK_OFFER",
                title=f"Post-upgrade regression detected in: {domains_summary}",
                description=(
                    f"Since the recent brain upgrade, a significant mastery drop "
                    f"(>= 15%) has been detected in {len(regressions)} domain(s). "
                    f"You can roll back to the previous version to restore "
                    f"{brain_state.learner_id}'s prior learning state."
                ),
                payload={
                    "regressions": regressions,
                    "snapshot_id": str(snapshot.id),
                    "upgrade_snapshot_version": snapshot.version_number,
                },
            )

            await publish_recommendation_created(
                learner_id=learner_id,
                recommendation_id=str(rec.id),
                rec_type="REGRESSION_ROLLBACK_OFFER",
                title=rec.title,
            )

            detected.append({
                "learner_id": learner_id,
                "brain_state_id": brain_state_id,
                "regressions": regressions,
                "recommendation_id": str(rec.id),
            })

            logger.info(
                "Regression detected for learner %s: %d domain(s) dropped >= 15%%",
                learner_id, len(regressions),
            )

        except Exception:
            logger.exception(
                "Error checking regression for brain_state %s",
                snapshot.brain_state_id,
            )

    logger.info(
        "Regression scan complete: %d regressions detected across %d brains checked",
        len(detected), len(unique_snapshots),
    )

    return detected
