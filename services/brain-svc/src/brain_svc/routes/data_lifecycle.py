"""Data lifecycle routes — export + deletion."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from brain_svc.middleware.auth import require_auth
from brain_svc.services.data_export import request_export
from brain_svc.services.data_lifecycle import delete_all_learner_data

router = APIRouter(prefix="/brain", tags=["data-lifecycle"])


class ExportResponse(BaseModel):
    export_id: str
    status: str
    download_url: str | None = None
    expires_at: str | None = None
    error: str | None = None


class DeleteRequest(BaseModel):
    reason: str = "erasure_request"


class DeleteResponse(BaseModel):
    status: str
    deletion_summary: dict[str, int] | None = None
    error: str | None = None


@router.post("/{learner_id}/export", response_model=ExportResponse)
async def export_brain_data(
    learner_id: str,
    claims: dict = Depends(require_auth),
):
    """Initiate a full brain data export for a learner.

    Returns a download URL (signed, 72hr expiry) when complete.
    """
    initiated_by = claims.get("sub", "unknown")
    result = await request_export(learner_id, initiated_by)
    return ExportResponse(**result)


@router.post("/{learner_id}/delete-data", response_model=DeleteResponse)
async def delete_learner_data(
    learner_id: str,
    body: DeleteRequest,
    claims: dict = Depends(require_auth),
):
    """Delete ALL data for a learner (GDPR Article 17 erasure).

    This action is irreversible. The data_lifecycle_events audit table
    is preserved for compliance.
    """
    initiated_by = claims.get("sub", "unknown")
    try:
        summary = await delete_all_learner_data(
            learner_id, initiated_by, body.reason,
        )
        return DeleteResponse(status="completed", deletion_summary=summary)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
