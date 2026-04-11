from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services.llm_gateway import generate_completion
from ..services.prompt_builder import build_content_generation_prompt, build_tutor_system_prompt
from ..services.quality_gate import run_quality_gate

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
