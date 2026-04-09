"""Brain context route — aggregated view for learning-svc consumption."""

from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from brain_svc.db import get_session
from brain_svc.services.brain_state import get_brain_state


def _ensure_dict(val: Any, default: Any = None) -> Any:
    if default is None:
        default = {}
    if val is None:
        return default
    if isinstance(val, str):
        try:
            return json.loads(val)
        except (json.JSONDecodeError, ValueError):
            return default
    return val


def _ensure_list(val: Any) -> list:
    if val is None:
        return []
    if isinstance(val, str):
        try:
            parsed = json.loads(val)
            return parsed if isinstance(parsed, list) else []
        except (json.JSONDecodeError, ValueError):
            return []
    return val if isinstance(val, list) else []

router = APIRouter(prefix="/api/brain", tags=["context"])


class BrainContextResponse(BaseModel):
    learnerId: str
    enrolledGrade: int | None = None
    functioningLevel: str = "level2"
    communicationMode: str = "verbal"
    deliveryLevels: dict[str, str] = Field(default_factory=dict)
    accommodations: list[str] = Field(default_factory=list)
    masteryLevels: dict[str, dict[str, float]] = Field(default_factory=dict)
    masteryGaps: list[dict[str, Any]] = Field(default_factory=list)
    iepGoals: list[dict[str, Any]] = Field(default_factory=list)
    attentionSpanMinutes: int = 20
    preferredModality: str = "multi-sensory"
    cognitiveLoad: str = "MEDIUM"
    activeTutors: list[dict[str, str]] = Field(default_factory=list)
    curriculumFramework: str | None = None
    curriculumAlignment: list[str] = Field(default_factory=list)


def _extract_mastery_gaps(
    mastery_levels: dict[str, dict[str, float]],
    threshold: float = 0.6,
) -> list[dict[str, Any]]:
    gaps: list[dict[str, Any]] = []
    for subject, skills in mastery_levels.items():
        for skill, level in skills.items():
            if level < threshold:
                gaps.append({"subject": subject, "skill": skill, "level": level})
    gaps.sort(key=lambda g: g["level"])
    return gaps


@router.get("/{learner_id}/context", response_model=BrainContextResponse)
async def get_brain_context(learner_id: str):
    async with get_session() as session:
        bs = await get_brain_state(session, learner_id)
        if not bs:
            raise HTTPException(status_code=404, detail="Brain state not found")

        state = _ensure_dict(bs.state)
        flp = _ensure_dict(bs.functioning_level_profile)
        iep = _ensure_dict(bs.iep_profile)

        mastery_levels = state.get("mastery_levels", {})
        gaps = _extract_mastery_gaps(mastery_levels)

        active_tutors = _ensure_list(bs.active_tutors)

        return BrainContextResponse(
            learnerId=str(bs.learner_id),
            enrolledGrade=state.get("enrolled_grade"),
            functioningLevel=flp.get("level", "level2"),
            communicationMode=state.get("communication_style", "verbal"),
            deliveryLevels=_ensure_dict(bs.delivery_levels),
            accommodations=state.get("active_accommodations", []),
            masteryLevels=mastery_levels,
            masteryGaps=gaps,
            iepGoals=iep.get("goals", []),
            attentionSpanMinutes=bs.attention_span_minutes or 20,
            preferredModality=bs.preferred_modality or "multi-sensory",
            cognitiveLoad=bs.cognitive_load or "MEDIUM",
            activeTutors=[
                {"tutorId": t.get("tutor_id", ""), "subject": t.get("subject", "")}
                for t in active_tutors if isinstance(t, dict)
            ],
            curriculumFramework=state.get("curriculum_framework"),
            curriculumAlignment=state.get("curriculum_alignment", []),
        )
