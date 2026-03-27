"""Main Brain seed routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from brain_svc.middleware.auth import require_auth
from brain_svc.services.main_brain import (
    create_seed,
    get_seed,
    list_seeds,
    resolve_seed_for_learner,
)

router = APIRouter(prefix="/main-brain", tags=["main-brain"])


class SeedResponse(BaseModel):
    version: str
    mastery_template: dict[str, float] = Field(default_factory=dict)
    delivery_levels: dict[str, Any] = Field(default_factory=dict)
    created_at: str | None = None


class CreateSeedRequest(BaseModel):
    version: str
    mastery_template: dict[str, float] | None = None
    accommodation_defaults: dict[str, list[str]] | None = None
    delivery_levels: dict[str, dict[str, str]] | None = None
    curriculum_alignment: dict[str, list[str]] | None = None


class ResolveSeedRequest(BaseModel):
    enrolled_grade: int
    functioning_level: str


@router.get("/seeds", response_model=list[SeedResponse])
async def list_all_seeds(_claims: dict = Depends(require_auth)):
    seeds = list_seeds()
    return [
        SeedResponse(
            version=s["version"],
            mastery_template=s.get("mastery_template", {}),
            delivery_levels=s.get("delivery_levels", {}),
            created_at=s.get("created_at"),
        )
        for s in seeds
    ]


@router.get("/seeds/{version}", response_model=SeedResponse)
async def get_seed_by_version(version: str, _claims: dict = Depends(require_auth)):
    seed = get_seed(version)
    if not seed:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Seed not found")
    return SeedResponse(
        version=seed["version"],
        mastery_template=seed.get("mastery_template", {}),
        delivery_levels=seed.get("delivery_levels", {}),
        created_at=seed.get("created_at"),
    )


@router.post("/seeds", response_model=SeedResponse, status_code=201)
async def create_new_seed(body: CreateSeedRequest, _claims: dict = Depends(require_auth)):
    seed = create_seed(
        version=body.version,
        mastery_template=body.mastery_template,
        accommodation_defaults=body.accommodation_defaults,
        delivery_levels=body.delivery_levels,
        curriculum_alignment=body.curriculum_alignment,
    )
    return SeedResponse(
        version=seed["version"],
        mastery_template=seed.get("mastery_template", {}),
        delivery_levels=seed.get("delivery_levels", {}),
        created_at=seed.get("created_at"),
    )


@router.post("/resolve")
async def resolve_seed(body: ResolveSeedRequest, _claims: dict = Depends(require_auth)):
    result = resolve_seed_for_learner(body.enrolled_grade, body.functioning_level)
    return result
