"""Data deletion pipeline for GDPR compliance.

Cascading deletion of all learner data across all tables.
The data_lifecycle_events audit table is NEVER deleted.
User records are anonymized (name replaced, email hashed).
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.db import get_session
from brain_svc.nats_client import publish_event
from brain_svc.redis_client import get_redis

logger = logging.getLogger(__name__)

ANONYMIZATION_SALT = os.environ.get("ANONYMIZATION_SALT", "aivo-gdpr-salt-2024")


async def delete_all_learner_data(
    learner_id: str,
    initiated_by: str,
    reason: str = "erasure_request",
) -> dict[str, Any]:
    """Delete ALL data for a learner across all tables.

    This is called either:
    1. After subscription grace period expires (30 days)
    2. Immediately on GDPR Article 17 erasure request

    The data_lifecycle_events table is NEVER deleted (compliance audit trail).

    Args:
        learner_id: The learner's UUID.
        initiated_by: User ID who initiated the deletion.
        reason: 'grace_period_expired' or 'erasure_request'.

    Returns:
        Summary of deleted records per table.
    """
    await _log_lifecycle_event(learner_id, "DATA_DELETION_STARTED", initiated_by, {
        "reason": reason,
    })

    deletion_summary: dict[str, int] = {}

    try:
        async with get_session() as session:
            # Delete in dependency order (children before parents)

            # 1. Gamification data
            deletion_summary["xp_events"] = await _delete_rows(
                session, "DELETE FROM xp_events WHERE learner_id = :lid", learner_id)
            deletion_summary["learner_badges"] = await _delete_rows(
                session, "DELETE FROM learner_badges WHERE learner_id = :lid", learner_id)
            deletion_summary["learner_quests"] = await _delete_rows(
                session, "DELETE FROM learner_quests WHERE learner_id = :lid", learner_id)
            deletion_summary["learner_xp"] = await _delete_rows(
                session, "DELETE FROM learner_xp WHERE learner_id = :lid", learner_id)

            # 2. Functional curriculum
            deletion_summary["learner_milestones"] = await _delete_rows(
                session, "DELETE FROM learner_milestones WHERE learner_id = :lid", learner_id)

            # 3. Homework data
            deletion_summary["homework_sessions"] = await _delete_rows(
                session, "DELETE FROM homework_sessions WHERE learner_id = :lid", learner_id)
            deletion_summary["homework_assignments"] = await _delete_rows(
                session, "DELETE FROM homework_assignments WHERE learner_id = :lid", learner_id)

            # 4. Learning sessions
            deletion_summary["learning_sessions"] = await _delete_rows(
                session, "DELETE FROM learning_sessions WHERE learner_id = :lid", learner_id)

            # 5. Tutor sessions and subscriptions
            deletion_summary["tutor_sessions"] = await _delete_rows(
                session, "DELETE FROM tutor_sessions WHERE learner_id = :lid", learner_id)
            deletion_summary["tutor_subscriptions"] = await _delete_rows(
                session, "DELETE FROM tutor_subscriptions WHERE learner_id = :lid", learner_id)

            # 6. Recommendations
            deletion_summary["recommendations"] = await _delete_rows(
                session, "DELETE FROM recommendations WHERE learner_id = :lid", learner_id)

            # 7. IEP data
            deletion_summary["iep_goals"] = await _delete_rows(
                session, "DELETE FROM iep_goals WHERE learner_id = :lid", learner_id)
            deletion_summary["iep_documents"] = await _delete_rows(
                session, "DELETE FROM iep_documents WHERE learner_id = :lid", learner_id)

            # 8. Assessment data
            deletion_summary["assessment_items"] = await _delete_rows(
                session, """
                DELETE FROM assessment_items WHERE assessment_id IN (
                    SELECT id FROM baseline_assessments WHERE learner_id = :lid
                )
                """, learner_id)
            deletion_summary["baseline_assessments"] = await _delete_rows(
                session, "DELETE FROM baseline_assessments WHERE learner_id = :lid", learner_id)
            deletion_summary["parent_assessments"] = await _delete_rows(
                session, "DELETE FROM parent_assessments WHERE learner_id = :lid", learner_id)

            # 9. Brain data (episodes → snapshots → states)
            deletion_summary["brain_episodes"] = await _delete_rows(
                session, """
                DELETE FROM brain_episodes WHERE brain_state_id IN (
                    SELECT id FROM brain_states WHERE learner_id = :lid
                )
                """, learner_id)
            deletion_summary["brain_state_snapshots"] = await _delete_rows(
                session, """
                DELETE FROM brain_state_snapshots WHERE brain_state_id IN (
                    SELECT id FROM brain_states WHERE learner_id = :lid
                )
                """, learner_id)
            deletion_summary["brain_states"] = await _delete_rows(
                session, "DELETE FROM brain_states WHERE learner_id = :lid", learner_id)

            # 10. Classroom enrollment
            deletion_summary["classroom_learners"] = await _delete_rows(
                session, "DELETE FROM classroom_learners WHERE learner_id = :lid", learner_id)

            # 11. Collaboration links
            deletion_summary["learner_teachers"] = await _delete_rows(
                session, "DELETE FROM learner_teachers WHERE learner_id = :lid", learner_id)
            deletion_summary["learner_caregivers"] = await _delete_rows(
                session, "DELETE FROM learner_caregivers WHERE learner_id = :lid", learner_id)

            # 12. Anonymize user record (irreversible)
            await _anonymize_learner(session, learner_id)
            deletion_summary["learner_anonymized"] = 1

        # Clear Redis cache
        redis = await get_redis()
        await redis.delete(f"brain:state:{learner_id}")

        event_type = "ERASURE_COMPLETED" if reason == "erasure_request" else "DATA_DELETION_COMPLETED"
        await _log_lifecycle_event(learner_id, event_type, initiated_by, {
            "reason": reason,
            "deletion_summary": deletion_summary,
        })

        await publish_event("aivo.brain.data.deleted", {
            "learnerId": learner_id,
            "reason": reason,
            "deletionSummary": deletion_summary,
        })

        logger.info("Data deletion completed for learner %s: %s", learner_id, deletion_summary)
        return deletion_summary

    except Exception as exc:
        logger.error("Data deletion failed for learner %s: %s", learner_id, exc, exc_info=True)
        await _log_lifecycle_event(learner_id, "DATA_DELETION_STARTED", initiated_by, {
            "reason": reason,
            "error": str(exc),
            "partial_summary": deletion_summary,
        })
        raise


async def _delete_rows(session: AsyncSession, query: str, learner_id: str) -> int:
    """Execute a DELETE statement and return the number of rows affected."""
    result = await session.execute(text(query).bindparams(lid=learner_id))
    return result.rowcount


async def _anonymize_learner(session: AsyncSession, learner_id: str) -> None:
    """Anonymize the learner record — name replaced, email hashed with salt.

    This is irreversible. The record is kept for billing audit purposes.
    """
    email_hash = hashlib.sha256(
        f"{learner_id}:{ANONYMIZATION_SALT}".encode()
    ).hexdigest()[:32]

    await session.execute(text("""
        UPDATE learners SET
            name = 'Deleted User',
            avatar_url = NULL,
            functioning_level = 'STANDARD',
            communication_mode = 'VERBAL',
            updated_at = NOW()
        WHERE id = :lid
    """).bindparams(lid=learner_id))

    # Also anonymize the user record linked to this learner
    await session.execute(text("""
        UPDATE users SET
            name = 'Deleted User',
            email = :email_hash,
            avatar_url = NULL,
            status = 'SUSPENDED',
            updated_at = NOW()
        WHERE id = (SELECT user_id FROM learners WHERE id = :lid)
    """).bindparams(lid=learner_id, email_hash=f"deleted-{email_hash}@anonymized.aivo.ai"))


async def _log_lifecycle_event(
    learner_id: str,
    event_type: str,
    initiated_by: str,
    metadata: dict[str, Any],
) -> None:
    """Log a data lifecycle event to the compliance audit table."""
    async with get_session() as session:
        await session.execute(text("""
            INSERT INTO data_lifecycle_events (learner_id, event_type, initiated_by, metadata)
            VALUES (:learner_id, :event_type, :initiated_by, :metadata)
        """).bindparams(
            learner_id=learner_id,
            event_type=event_type,
            initiated_by=initiated_by,
            metadata=json.dumps(metadata),
        ))
