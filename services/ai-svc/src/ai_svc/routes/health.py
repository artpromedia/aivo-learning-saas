"""Health check routes."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    return {"status": "ok", "service": "ai-svc"}


@router.get("/ready")
async def ready():
    return {"status": "ready"}
