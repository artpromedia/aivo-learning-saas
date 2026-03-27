"""Tests for content generation modules."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from ai_svc.llm.gateway import LLMGateway, LLMResponse
from ai_svc.generation.lesson_generator import LessonGenerator
from ai_svc.generation.tutor_responder import TutorResponder
from ai_svc.generation.homework_adapter import HomeworkAdapter
from ai_svc.generation.writing_feedback import WritingFeedbackGenerator
from ai_svc.generation.quiz_generator import QuizGenerator
from ai_svc.generation.activity_generator import ActivityGenerator


def _mock_gateway(content="Test content."):
    gw = AsyncMock(spec=LLMGateway)
    gw.generate = AsyncMock(return_value=LLMResponse(
        content=content,
        model="test-model",
        prompt_tokens=50,
        completion_tokens=20,
        total_tokens=70,
        latency_ms=200.0,
        tier="SMART",
    ))
    return gw


def _standard_ctx():
    return {
        "enrolled_grade": 3,
        "functioning_level": "STANDARD",
        "delivery_levels": {"reading_level": "DEVELOPING"},
        "active_accommodations": [],
        "mastery_levels": {"MATH": 0.5},
    }


class TestLessonGenerator:
    @pytest.mark.asyncio
    async def test_generate(self):
        gw = _mock_gateway("Here is a lesson about fractions.")
        gen = LessonGenerator(gw)
        result = await gen.generate(
            learner_context=_standard_ctx(),
            subject="MATH",
            skill="fractions",
            grade=3,
        )
        assert "content" in result
        assert "quality_result" in result
        assert result["model"] == "test-model"
        assert result["usage"]["total_tokens"] == 70

    @pytest.mark.asyncio
    async def test_generate_with_persona(self):
        gw = _mock_gateway("Nova says: let's explore fractions!")
        gen = LessonGenerator(gw)
        result = await gen.generate(
            learner_context=_standard_ctx(),
            subject="MATH",
            skill="fractions",
            grade=3,
            tutor_persona="nova",
            mastery_gaps=["decimals"],
        )
        assert "content" in result

    @pytest.mark.asyncio
    async def test_generate_with_standards(self):
        gw = _mock_gateway("Standards-aligned lesson.")
        gen = LessonGenerator(gw)
        result = await gen.generate(
            learner_context=_standard_ctx(),
            subject="MATH",
            skill="fractions",
            grade=3,
            curriculum_standards=["[CC.MATH.3.1] Multiply within 100"],
        )
        assert result["content"] != ""


class TestTutorResponder:
    @pytest.mark.asyncio
    async def test_respond(self):
        gw = _mock_gateway("Great question! 2+2=4.")
        resp = TutorResponder(gw)
        result = await resp.respond(
            learner_context=_standard_ctx(),
            subject="MATH",
            user_input="What is 2+2?",
        )
        assert "response" in result
        assert result["persona"] == "math"

    @pytest.mark.asyncio
    async def test_respond_with_history(self):
        gw = _mock_gateway("Let me explain further.")
        resp = TutorResponder(gw)
        result = await resp.respond(
            learner_context=_standard_ctx(),
            subject="MATH",
            user_input="I still don't get it",
            conversation_history=[
                {"role": "user", "content": "What is 2+2?"},
                {"role": "assistant", "content": "2+2=4!"},
            ],
            tutor_persona="nova",
        )
        assert result["persona"] == "nova"

    @pytest.mark.asyncio
    async def test_respond_with_tenant_override(self):
        gw = _mock_gateway("Custom model response.")
        resp = TutorResponder(gw)
        result = await resp.respond(
            learner_context=_standard_ctx(),
            subject="ELA",
            user_input="Help with reading",
            tenant_override="custom/model",
        )
        assert "response" in result


class TestHomeworkAdapter:
    @pytest.mark.asyncio
    async def test_adapt(self):
        gw = _mock_gateway('{"adapted_problems": []}')
        adapter = HomeworkAdapter(gw)
        result = await adapter.adapt(
            learner_context=_standard_ctx(),
            homework_text="Solve: 3x+5=20",
            subject="MATH",
        )
        assert "adapted_content" in result
        assert "usage" in result


class TestWritingFeedbackGenerator:
    @pytest.mark.asyncio
    async def test_generate_feedback(self):
        gw = _mock_gateway('{"strengths": ["Good ideas"], "growth_target": "More detail"}')
        gen = WritingFeedbackGenerator(gw)
        result = await gen.generate_feedback(
            learner_context=_standard_ctx(),
            submission="My cat is nice.",
            prompt_text="Write about pets",
        )
        assert "feedback" in result


class TestQuizGenerator:
    @pytest.mark.asyncio
    async def test_generate(self):
        gw = _mock_gateway("Q1: What is 3+4? A) 5 B) 7")
        gen = QuizGenerator(gw)
        result = await gen.generate(
            learner_context=_standard_ctx(),
            subject="MATH",
            skills=["addition"],
            num_questions=3,
        )
        assert "quiz_content" in result


class TestActivityGenerator:
    @pytest.mark.asyncio
    async def test_generate(self):
        gw = _mock_gateway("Activity: Sensory exploration with textures.")
        gen = ActivityGenerator(gw)
        result = await gen.generate(
            learner_context={
                "enrolled_grade": 1,
                "functioning_level": "STANDARD",
                "delivery_levels": {},
                "active_accommodations": [],
            },
            domain="MOTOR_SENSORY",
        )
        assert "activity_guide" in result
