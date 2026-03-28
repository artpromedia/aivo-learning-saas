"""Versioning routes — snapshot management and rollback."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from brain_svc.db import get_session
from brain_svc.middleware.auth import require_auth
from brain_svc.services.brain_state import get_brain_state, get_brain_state_by_id
from brain_svc.services.versioning import (
    create_snapshot,
    get_snapshot,
    list_snapshots,
    rollback_to_snapshot,
)
from brain_svc.events.publishers import publish_snapshot_restored

router = APIRouter(prefix="/versioning", tags=["versioning"])


class SnapshotResponse(BaseModel):
    id: str
    brain_state_id: str
    trigger: str
    trigger_metadata: dict[str, Any] = Field(default_factory=dict)
    version_number: int
    created_at: str | None = None


class CreateSnapshotRequest(BaseModel):
    brain_state_id: str
    trigger: str
    trigger_metadata: dict[str, Any] = Field(default_factory=dict)


class RollbackRequest(BaseModel):
    brain_state_id: str
    snapshot_id: str


def _snap_response(s) -> SnapshotResponse:
    return SnapshotResponse(
        id=str(s.id),
        brain_state_id=str(s.brain_state_id),
        trigger=s.trigger,
        trigger_metadata=s.trigger_metadata or {},
        version_number=s.version_number,
        created_at=s.created_at.isoformat() if s.created_at else None,
    )


@router.get("/snapshots/{brain_state_id}", response_model=list[SnapshotResponse])
async def list_brain_snapshots(
    brain_state_id: str,
    limit: int = 50,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        snaps = await list_snapshots(session, brain_state_id, limit=limit)
        return [_snap_response(s) for s in snaps]


@router.post("/snapshots", response_model=SnapshotResponse, status_code=201)
async def create_brain_snapshot(
    body: CreateSnapshotRequest,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        bs = await get_brain_state_by_id(session, body.brain_state_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        snap = await create_snapshot(
            session=session,
            brain_state=bs,
            trigger=body.trigger,
            trigger_metadata=body.trigger_metadata,
        )
        return _snap_response(snap)


@router.post("/rollback")
async def rollback_brain(
    body: RollbackRequest,
    _claims: dict = Depends(require_auth),
):
    async with get_session() as session:
        bs = await get_brain_state_by_id(session, body.brain_state_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")
        snap = await get_snapshot(session, body.snapshot_id)
        if not snap:
            raise HTTPException(status_code=404, detail="Snapshot not found")
        if str(snap.brain_state_id) != body.brain_state_id:
            raise HTTPException(status_code=400, detail="Snapshot does not belong to this brain state")
        bs = await rollback_to_snapshot(session, bs, snap)
        return {"status": "rolled_back", "brain_state_id": str(bs.id)}


@router.post("/brain/{learner_id}/rollback/{snapshot_id}")
async def rollback_learner_brain(
    learner_id: str,
    snapshot_id: str,
    claims: dict = Depends(require_auth),
):
    """Rollback a learner's brain state to a specific snapshot.

    Creates a ROLLBACK snapshot before restoring, then publishes
    a brain.snapshot.restored event.
    """
    async with get_session() as session:
        bs = await get_brain_state(session, learner_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found for learner")
        snap = await get_snapshot(session, snapshot_id)
        if not snap:
            raise HTTPException(status_code=404, detail="Snapshot not found")
        if snap.brain_state_id != bs.id:
            raise HTTPException(
                status_code=400,
                detail="Snapshot does not belong to this learner's brain state",
            )

        bs = await rollback_to_snapshot(session, bs, snap)

    restored_by = claims.get("sub", "unknown")
    await publish_snapshot_restored(
        learner_id=learner_id,
        snapshot_id=snapshot_id,
        restored_by=restored_by,
    )

    return {
        "status": "rolled_back",
        "learner_id": learner_id,
        "brain_state_id": str(bs.id),
        "restored_snapshot_id": snapshot_id,
    }
