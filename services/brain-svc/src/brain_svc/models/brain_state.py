"""SQLAlchemy model for brain_states table."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class BrainState(Base):
    __tablename__ = "brain_states"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    learner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, unique=True, index=True
    )
    main_brain_version: Mapped[str | None] = mapped_column(String(64))
    seed_version: Mapped[str | None] = mapped_column(String(64))
    state: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    functioning_level_profile: Mapped[dict | None] = mapped_column(
        JSONB, server_default=text("'{}'::jsonb")
    )
    iep_profile: Mapped[dict | None] = mapped_column(
        JSONB, server_default=text("'{}'::jsonb")
    )
    active_tutors: Mapped[list | None] = mapped_column(
        JSONB, server_default=text("'[]'::jsonb")
    )
    delivery_levels: Mapped[dict | None] = mapped_column(
        JSONB, server_default=text("'{}'::jsonb")
    )
    preferred_modality: Mapped[str | None] = mapped_column(String(64))
    attention_span_minutes: Mapped[int | None] = mapped_column(Integer)
    cognitive_load: Mapped[str | None] = mapped_column(
        String(16), server_default=text("'MEDIUM'")
    )
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
