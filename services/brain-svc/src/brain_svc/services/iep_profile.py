"""IEP profile service — document and goal tracking."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from brain_svc.models.iep import IepDocument, IepGoal

logger = logging.getLogger(__name__)


async def create_iep_document(
    session: AsyncSession,
    learner_id: str,
    uploaded_by: str,
    file_url: str,
    file_type: str,
    parsed_data: dict[str, Any] | None = None,
) -> IepDocument:
    """Create a new IEP document record."""
    doc = IepDocument(
        learner_id=uuid.UUID(learner_id),
        uploaded_by=uuid.UUID(uploaded_by),
        file_url=file_url,
        file_type=file_type,
        parsed_data=parsed_data or {},
        parse_status="PENDING" if parsed_data is None else "COMPLETED",
    )
    session.add(doc)
    await session.flush()
    return doc


async def get_iep_documents(
    session: AsyncSession,
    learner_id: str,
) -> list[IepDocument]:
    """List all IEP documents for a learner."""
    result = await session.execute(
        select(IepDocument)
        .where(IepDocument.learner_id == uuid.UUID(learner_id))
        .order_by(IepDocument.created_at.desc())
    )
    return list(result.scalars().all())


async def confirm_iep_document(
    session: AsyncSession,
    document: IepDocument,
    confirmed_by: str,
) -> IepDocument:
    """Mark an IEP document as confirmed."""
    document.confirmed_by = uuid.UUID(confirmed_by)
    document.confirmed_at = datetime.now(timezone.utc)
    document.parse_status = "CONFIRMED"
    await session.flush()
    return document


async def create_iep_goal(
    session: AsyncSession,
    learner_id: str,
    iep_document_id: str,
    goal_text: str,
    domain: str,
    target_metric: str | None = None,
    target_value: float | None = None,
) -> IepGoal:
    """Create a new IEP goal."""
    goal = IepGoal(
        learner_id=uuid.UUID(learner_id),
        iep_document_id=uuid.UUID(iep_document_id),
        goal_text=goal_text,
        domain=domain,
        target_metric=target_metric,
        target_value=target_value,
        current_value=0.0,
        status="ACTIVE",
    )
    session.add(goal)
    await session.flush()
    return goal


async def get_iep_goals(
    session: AsyncSession,
    learner_id: str,
    status: str | None = None,
) -> list[IepGoal]:
    """List IEP goals for a learner."""
    filters = [IepGoal.learner_id == uuid.UUID(learner_id)]
    if status:
        filters.append(IepGoal.status == status)
    result = await session.execute(
        select(IepGoal)
        .where(and_(*filters))
        .order_by(IepGoal.created_at.desc())
    )
    return list(result.scalars().all())


async def update_iep_goal_progress(
    session: AsyncSession,
    goal: IepGoal,
    current_value: float,
) -> IepGoal:
    """Update progress on an IEP goal. Marks as MET if target reached."""
    goal.current_value = current_value
    goal.updated_at = datetime.now(timezone.utc)

    if goal.target_value is not None and current_value >= goal.target_value:
        goal.status = "MET"
        goal.met_at = datetime.now(timezone.utc)
        logger.info("IEP goal %s met for learner %s", goal.id, goal.learner_id)

    await session.flush()
    return goal
