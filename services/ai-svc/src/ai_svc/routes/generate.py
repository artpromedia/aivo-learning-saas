"""Content generation routes — lessons, quizzes, activities."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ai_svc.dependencies import get_gateway
from ai_svc.generation.lesson_generator import LessonGenerator
from ai_svc.generation.quiz_generator import QuizGenerator
from ai_svc.generation.activity_generator import ActivityGenerator
from ai_svc.middleware.auth import require_auth

router = APIRouter(prefix="/ai", tags=["generate"])


class GenerateRequest(BaseModel):
    session_type: str  # lesson, quiz, activity
    learner_context: dict[str, Any] = Field(default_factory=dict)
    subject: str = ""
    skill: str = ""
    grade: int = 5
    mastery_gaps: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    num_questions: int = 5
    domain: str = ""
    tutor_persona: str | None = None
    tenant_override: str | None = None


@router.post("/generate")
async def generate_content(
    body: GenerateRequest,
    _claims: dict = Depends(require_auth),
):
    gateway = get_gateway()

    if body.session_type == "lesson":
        gen = LessonGenerator(gateway)
        result = await gen.generate(
            learner_context=body.learner_context,
            subject=body.subject,
            skill=body.skill,
            grade=body.grade,
            mastery_gaps=body.mastery_gaps,
            tutor_persona=body.tutor_persona,
            tenant_override=body.tenant_override,
        )
    elif body.session_type == "quiz":
        gen = QuizGenerator(gateway)
        result = await gen.generate(
            learner_context=body.learner_context,
            subject=body.subject,
            skills=body.skills or [body.skill],
            num_questions=body.num_questions,
            tenant_override=body.tenant_override,
        )
    elif body.session_type == "activity":
        gen = ActivityGenerator(gateway)
        result = await gen.generate(
            learner_context=body.learner_context,
            domain=body.domain,
            tenant_override=body.tenant_override,
        )
    else:
        return {"error": f"Unknown session_type: {body.session_type}"}

    return result
