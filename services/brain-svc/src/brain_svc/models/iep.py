"""SQLAlchemy models for iep_documents and iep_goals tables."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from brain_svc.models.brain_state import Base


class IepDocument(Base):
    __tablename__ = "iep_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    learner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    uploaded_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    file_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    file_type: Mapped[str] = mapped_column(String(64), nullable=False)
    parsed_data: Mapped[dict | None] = mapped_column(JSONB)
    parse_status: Mapped[str] = mapped_column(String(32), nullable=False, default="PENDING")
    confirmed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class IepGoal(Base):
    __tablename__ = "iep_goals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    learner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    iep_document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("iep_documents.id", ondelete="SET NULL"),
    )
    goal_text: Mapped[str] = mapped_column(String(4096), nullable=False)
    domain: Mapped[str] = mapped_column(String(128), nullable=False)
    target_metric: Mapped[str | None] = mapped_column(String(255))
    target_value: Mapped[str | None] = mapped_column(String(128))
    current_value: Mapped[str | None] = mapped_column(String(128))
    status: Mapped[str] = mapped_column(
        String(32), nullable=False, default="ACTIVE", index=True
    )
    met_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
