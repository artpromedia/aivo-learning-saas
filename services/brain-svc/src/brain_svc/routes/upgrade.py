"""Upgrade routes — internal endpoints for brain version upgrades and regression detection."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from brain_svc.db import get_session
from brain_svc.services.upgrade import upgrade_all_brains
from brain_svc.services.regression_detector import detect_regressions

router = APIRouter(prefix="/brain/internal", tags=["internal"])


class UpgradeRequest(BaseModel):
    new_version: str
    dry_run: bool = False


class UpgradeResponse(BaseModel):
    version: str
    total_upgraded: int
    total_failed: int
    total_skipped: int
    total_brains: int
    duration_ms: int
    dry_run: bool


@router.post("/upgrade", response_model=UpgradeResponse)
async def trigger_upgrade(body: UpgradeRequest):
    """Trigger a brain version upgrade across all brains.

    Internal endpoint — called by admin-svc.
    """
    if not body.new_version.strip():
        raise HTTPException(status_code=400, detail="new_version is required")

    async with get_session() as session:
        stats = await upgrade_all_brains(
            session=session,
            new_version=body.new_version,
            dry_run=body.dry_run,
        )

    return UpgradeResponse(
        version=stats["version"],
        total_upgraded=stats["total_upgraded"],
        total_failed=stats["total_failed"],
        total_skipped=stats["total_skipped"],
        total_brains=stats["total_brains"],
        duration_ms=stats["duration_ms"],
        dry_run=stats["dry_run"],
    )


@router.post("/detect-regressions")
async def trigger_regression_detection():
    """Trigger a regression detection scan across recently-upgraded brains.

    Internal endpoint — called by cron or admin-svc.
    """
    async with get_session() as session:
        regressions = await detect_regressions(session)

    return {
        "total_regressions": len(regressions),
        "regressions": regressions,
    }
