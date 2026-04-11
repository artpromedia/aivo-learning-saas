import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services.llm_gateway import generate_completion
from ..services.prompt_builder import build_content_generation_prompt, build_tutor_system_prompt
from ..services.quality_gate import run_quality_gate
from ..services.baseline_generator import build_baseline_generation_prompt

logger = logging.getLogger("ai-svc.generate")

router = APIRouter(prefix="/api/ai", tags=["content-generation"])


class ContentRequest(BaseModel):
    subject: str
    topic: str
    grade_target: str = "THIRD"
    delivery_level: str = "THIRD"
    functioning_level: str = "STANDARD"
    content_type: str = "LESSON"
    brain_context: dict = {}
    max_tokens: int = 2000


class ContentResponse(BaseModel):
    content: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    quality_score: float
    quality_gate_passed: bool
    quality_gate_log: dict


class TutorChatRequest(BaseModel):
    tutor_sku: str
    learner_id: str
    functioning_level: str = "STANDARD"
    brain_context: dict = {}
    messages: list[dict] = []
    max_tokens: int = 1500


class TutorChatResponse(BaseModel):
    response: str
    model: str
    prompt_tokens: int
    completion_tokens: int


@router.post("/generate", response_model=ContentResponse)
async def generate_content(req: ContentRequest):
    system_prompt, user_prompt = build_content_generation_prompt(
        subject=req.subject,
        topic=req.topic,
        grade_target=req.grade_target,
        delivery_level=req.delivery_level,
        functioning_level=req.functioning_level,
        brain_context=req.brain_context,
        content_type=req.content_type,
    )

    try:
        result = await generate_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=req.max_tokens,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM generation failed: {str(e)}")

    quality = run_quality_gate(
        content=result["content"],
        delivery_level=req.delivery_level,
        functioning_level=req.functioning_level,
        sensory_profile=req.brain_context.get("sensory_profile"),
        accommodations=req.brain_context.get("active_accommodations"),
    )

    return ContentResponse(
        content=result["content"],
        model=result["model"],
        prompt_tokens=result["prompt_tokens"],
        completion_tokens=result["completion_tokens"],
        quality_score=quality["score"],
        quality_gate_passed=quality["passed"],
        quality_gate_log=quality,
    )


@router.post("/tutor/chat", response_model=TutorChatResponse)
async def tutor_chat(req: TutorChatRequest):
    system_prompt = build_tutor_system_prompt(
        tutor_sku=req.tutor_sku,
        brain_context=req.brain_context,
        functioning_level=req.functioning_level,
    )

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(req.messages)

    try:
        result = await generate_completion(
            system_prompt=system_prompt,
            user_prompt=req.messages[-1]["content"] if req.messages else "Hello! What shall we learn today?",
            max_tokens=req.max_tokens,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM chat failed: {str(e)}")

    return TutorChatResponse(
        response=result["content"],
        model=result["model"],
        prompt_tokens=result["prompt_tokens"],
        completion_tokens=result["completion_tokens"],
    )


class BaselineRequest(BaseModel):
    parent_assessment: dict
    functioning_level: str = "STANDARD"


class BaselineResponse(BaseModel):
    questions: list
    subjects: list
    model: str
    prompt_tokens: int
    completion_tokens: int


@router.post("/generate-baseline", response_model=BaselineResponse)
async def generate_baseline(req: BaselineRequest):
    from ..services.baseline_generator import SUBJECTS

    system_prompt, user_prompt = build_baseline_generation_prompt(req.parent_assessment)

    try:
        result = await generate_completion(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=4000,
            temperature=0.6,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"LLM baseline generation failed: {str(e)}")

    raw = result["content"].strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
        if raw.endswith("```"):
            raw = raw[:-3]

    try:
        parsed = json.loads(raw)
        questions = parsed.get("questions", [])
    except json.JSONDecodeError:
        logger.error(f"Failed to parse baseline JSON: {raw[:200]}")
        raise HTTPException(status_code=502, detail="AI returned invalid JSON for baseline questions")

    REQUIRED_SUBJECTS = {"math", "ela", "science", "speech", "sel", "life_skills", "executive_function"}
    valid_questions = []
    for q in questions:
        if not isinstance(q, dict):
            continue
        if not all(k in q for k in ("id", "subject", "questionText", "options", "correctAnswer")):
            continue
        if not isinstance(q["options"], list) or len(q["options"]) < 2:
            continue
        valid_answers = {o.get("value") for o in q["options"] if isinstance(o, dict) and "value" in o}
        if q["correctAnswer"] not in valid_answers:
            continue
        if q.get("subject") not in REQUIRED_SUBJECTS:
            continue
        valid_questions.append(q)

    if len(valid_questions) < 14:
        raise HTTPException(status_code=502, detail=f"AI generated too few valid questions ({len(valid_questions)}), expected at least 14")

    questions = valid_questions

    return BaselineResponse(
        questions=questions,
        subjects=SUBJECTS,
        model=result["model"],
        prompt_tokens=result["prompt_tokens"],
        completion_tokens=result["completion_tokens"],
    )
