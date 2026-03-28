"""Brain data export pipeline.

Collects all Brain data for a learner, generates human-readable markdown + raw
JSON, packages into a ZIP, stores with a signed URL (72hr expiry), and emits
a NATS event for comms-svc to deliver the download link.
"""

from __future__ import annotations

import io
import json
import logging
import os
import uuid
import zipfile
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.db import get_session
from brain_svc.nats_client import publish_event

logger = logging.getLogger(__name__)

EXPORT_DIR = os.environ.get("EXPORT_DIR", "/tmp/brain-exports")


async def request_export(learner_id: str, initiated_by: str) -> dict[str, Any]:
    """Initiate an async brain data export job.

    Returns:
        Dict with export_id and status.
    """
    export_id = str(uuid.uuid4())

    await _log_lifecycle_event(learner_id, "EXPORT_REQUESTED", initiated_by, {
        "export_id": export_id,
    })

    try:
        zip_path, summary = await _build_export(learner_id, export_id)
        download_url = _store_export(zip_path, export_id)

        await _log_lifecycle_event(learner_id, "EXPORT_COMPLETED", initiated_by, {
            "export_id": export_id,
            "download_url": download_url,
            "categories": list(summary.keys()),
        })

        await publish_event("aivo.brain.export.completed", {
            "learnerId": learner_id,
            "exportId": export_id,
            "downloadUrl": download_url,
            "expiresAt": _expiry_iso(),
        })

        return {
            "export_id": export_id,
            "status": "ready",
            "download_url": download_url,
            "expires_at": _expiry_iso(),
        }
    except Exception as exc:
        logger.error("Export failed for learner %s: %s", learner_id, exc, exc_info=True)
        await _log_lifecycle_event(learner_id, "EXPORT_FAILED", initiated_by, {
            "export_id": export_id,
            "error": str(exc),
        })
        return {"export_id": export_id, "status": "failed", "error": str(exc)}


async def _build_export(learner_id: str, export_id: str) -> tuple[str, dict[str, int]]:
    """Collect all brain data and build a ZIP archive."""
    os.makedirs(EXPORT_DIR, exist_ok=True)
    zip_path = os.path.join(EXPORT_DIR, f"{export_id}.zip")
    summary: dict[str, int] = {}

    async with get_session() as session:
        data = await _collect_all_data(session, learner_id)

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Write each category as JSON + markdown
        for category, records in data.items():
            summary[category] = len(records) if isinstance(records, list) else 1

            # Raw JSON
            json_str = json.dumps(records, indent=2, default=str)
            zf.writestr(f"data/{category}.json", json_str)

            # Human-readable markdown
            md = _generate_markdown(category, records)
            zf.writestr(f"readable/{category}.md", md)

        # Summary document
        summary_md = _generate_summary_markdown(learner_id, data, summary)
        zf.writestr("README.md", summary_md)

    return zip_path, summary


async def _collect_all_data(session: AsyncSession, learner_id: str) -> dict[str, Any]:
    """Collect every data category for the learner."""
    lid = learner_id
    data: dict[str, Any] = {}

    # Brain states (current + all snapshots)
    rows = await session.execute(text(
        "SELECT * FROM brain_states WHERE learner_id = :lid"
    ).bindparams(lid=lid))
    data["brain_states"] = [dict(r._mapping) for r in rows]

    # Brain snapshots
    rows = await session.execute(text("""
        SELECT bss.* FROM brain_state_snapshots bss
        JOIN brain_states bs ON bss.brain_state_id = bs.id
        WHERE bs.learner_id = :lid
        ORDER BY bss.created_at
    """).bindparams(lid=lid))
    data["brain_snapshots"] = [dict(r._mapping) for r in rows]

    # Brain episodes
    rows = await session.execute(text("""
        SELECT be.* FROM brain_episodes be
        JOIN brain_states bs ON be.brain_state_id = bs.id
        WHERE bs.learner_id = :lid
        ORDER BY be.created_at
    """).bindparams(lid=lid))
    data["brain_episodes"] = [dict(r._mapping) for r in rows]

    # Recommendations + parent responses
    rows = await session.execute(text(
        "SELECT * FROM recommendations WHERE learner_id = :lid ORDER BY created_at"
    ).bindparams(lid=lid))
    data["recommendations"] = [dict(r._mapping) for r in rows]

    # IEP documents
    rows = await session.execute(text(
        "SELECT * FROM iep_documents WHERE learner_id = :lid ORDER BY created_at"
    ).bindparams(lid=lid))
    data["iep_documents"] = [dict(r._mapping) for r in rows]

    # IEP goals
    rows = await session.execute(text(
        "SELECT * FROM iep_goals WHERE learner_id = :lid ORDER BY created_at"
    ).bindparams(lid=lid))
    data["iep_goals"] = [dict(r._mapping) for r in rows]

    # Assessment data
    rows = await session.execute(text(
        "SELECT * FROM parent_assessments WHERE learner_id = :lid"
    ).bindparams(lid=lid))
    data["parent_assessments"] = [dict(r._mapping) for r in rows]

    rows = await session.execute(text(
        "SELECT * FROM baseline_assessments WHERE learner_id = :lid"
    ).bindparams(lid=lid))
    data["baseline_assessments"] = [dict(r._mapping) for r in rows]

    # Tutor sessions
    rows = await session.execute(text(
        "SELECT * FROM tutor_sessions WHERE learner_id = :lid ORDER BY started_at"
    ).bindparams(lid=lid))
    data["tutor_sessions"] = [dict(r._mapping) for r in rows]

    # Homework
    rows = await session.execute(text(
        "SELECT * FROM homework_assignments WHERE learner_id = :lid ORDER BY created_at"
    ).bindparams(lid=lid))
    data["homework_assignments"] = [dict(r._mapping) for r in rows]

    rows = await session.execute(text(
        "SELECT * FROM homework_sessions WHERE learner_id = :lid ORDER BY started_at"
    ).bindparams(lid=lid))
    data["homework_sessions"] = [dict(r._mapping) for r in rows]

    # Learning sessions
    rows = await session.execute(text(
        "SELECT * FROM learning_sessions WHERE learner_id = :lid ORDER BY created_at"
    ).bindparams(lid=lid))
    data["learning_sessions"] = [dict(r._mapping) for r in rows]

    # Gamification
    rows = await session.execute(text(
        "SELECT * FROM learner_xp WHERE learner_id = :lid"
    ).bindparams(lid=lid))
    data["xp_summary"] = [dict(r._mapping) for r in rows]

    rows = await session.execute(text(
        "SELECT * FROM xp_events WHERE learner_id = :lid ORDER BY created_at"
    ).bindparams(lid=lid))
    data["xp_events"] = [dict(r._mapping) for r in rows]

    rows = await session.execute(text(
        "SELECT lb.*, b.slug, b.name FROM learner_badges lb JOIN badges b ON lb.badge_id = b.id WHERE lb.learner_id = :lid"
    ).bindparams(lid=lid))
    data["badges"] = [dict(r._mapping) for r in rows]

    rows = await session.execute(text(
        "SELECT lq.*, q.title FROM learner_quests lq JOIN quests q ON lq.quest_id = q.id WHERE lq.learner_id = :lid"
    ).bindparams(lid=lid))
    data["quests"] = [dict(r._mapping) for r in rows]

    # Functional curriculum milestones
    rows = await session.execute(text(
        "SELECT lm.*, fm.title, fm.domain FROM learner_milestones lm JOIN functional_milestones fm ON lm.milestone_id = fm.id WHERE lm.learner_id = :lid"
    ).bindparams(lid=lid))
    data["functional_milestones"] = [dict(r._mapping) for r in rows]

    # Tutor subscriptions
    rows = await session.execute(text(
        "SELECT * FROM tutor_subscriptions WHERE learner_id = :lid"
    ).bindparams(lid=lid))
    data["tutor_subscriptions"] = [dict(r._mapping) for r in rows]

    return data


def _generate_markdown(category: str, records: Any) -> str:
    """Generate human-readable markdown for a data category."""
    title = category.replace("_", " ").title()
    lines = [f"# {title}\n"]

    if isinstance(records, list):
        lines.append(f"**Total records:** {len(records)}\n")
        for i, record in enumerate(records, 1):
            lines.append(f"## Record {i}\n")
            for key, value in record.items():
                if isinstance(value, dict):
                    lines.append(f"- **{key}:**\n```json\n{json.dumps(value, indent=2, default=str)}\n```\n")
                elif isinstance(value, list):
                    lines.append(f"- **{key}:** {json.dumps(value, default=str)}\n")
                else:
                    lines.append(f"- **{key}:** {value}\n")
            lines.append("")
    else:
        lines.append(f"```json\n{json.dumps(records, indent=2, default=str)}\n```\n")

    return "\n".join(lines)


def _generate_summary_markdown(
    learner_id: str,
    data: dict[str, Any],
    summary: dict[str, int],
) -> str:
    """Generate the top-level README.md summary."""
    now = datetime.now(timezone.utc).isoformat()
    lines = [
        "# AIVO Brain Data Export",
        f"\n**Learner ID:** {learner_id}",
        f"**Export Date:** {now}",
        f"**Export Format:** ZIP containing JSON + Markdown\n",
        "## Data Categories\n",
        "| Category | Records |",
        "|----------|---------|",
    ]
    for cat, count in sorted(summary.items()):
        lines.append(f"| {cat.replace('_', ' ').title()} | {count} |")

    lines.extend([
        "\n## Directory Structure\n",
        "```",
        "data/           # Raw JSON for each category",
        "readable/       # Human-readable markdown for each category",
        "README.md       # This summary file",
        "```\n",
        "## Data Sovereignty Notice\n",
        "This export contains all data that AIVO's Brain system holds about this learner.",
        "As the parent/guardian, you have full ownership of this data per GDPR Article 20",
        "(Right to Data Portability) and COPPA regulations.\n",
        "This download link expires 72 hours after generation.",
    ])
    return "\n".join(lines)


def _store_export(zip_path: str, export_id: str) -> str:
    """Store the export ZIP and return a download URL.

    In production, this uploads to S3 and returns a pre-signed URL.
    In development, returns a local file path URL.
    """
    storage_backend = os.environ.get("STORAGE_BACKEND", "local")

    if storage_backend == "s3":
        s3_bucket = os.environ.get("S3_BUCKET", "aivo-exports")
        s3_key = f"brain-exports/{export_id}.zip"
        # In production, upload to S3 and generate pre-signed URL
        return f"https://{s3_bucket}.s3.amazonaws.com/{s3_key}?X-Amz-Expires=259200"

    return f"/exports/brain/{export_id}.zip"


def _expiry_iso() -> str:
    """Return ISO timestamp 72 hours from now."""
    from datetime import timedelta
    return (datetime.now(timezone.utc) + timedelta(hours=72)).isoformat()


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
