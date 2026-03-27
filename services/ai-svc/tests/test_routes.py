"""Route integration tests."""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


class TestHealthRoutes:
    @pytest.mark.asyncio
    async def test_health(self, client):
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "ai-svc"

    @pytest.mark.asyncio
    async def test_ready(self, client):
        resp = await client.get("/ready")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ready"


class TestGenerateRoutes:
    @pytest.mark.asyncio
    async def test_generate_lesson(self, client):
        with patch("ai_svc.routes.generate.get_gateway") as mock_gw:
            mock_gateway = AsyncMock()
            mock_gw.return_value = mock_gateway

            # Mock the LessonGenerator
            with patch("ai_svc.routes.generate.LessonGenerator") as MockGen:
                mock_gen = AsyncMock()
                mock_gen.generate = AsyncMock(return_value={
                    "content": "Lesson content here",
                    "quality_result": {"passed": True, "gates": []},
                    "model": "test-model",
                    "usage": {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15, "latency_ms": 100},
                })
                MockGen.return_value = mock_gen

                resp = await client.post("/ai/generate", json={
                    "session_type": "lesson",
                    "subject": "MATH",
                    "skill": "fractions",
                    "grade": 3,
                    "learner_context": {"functioning_level": "STANDARD"},
                })
                assert resp.status_code == 200
                assert "content" in resp.json()

    @pytest.mark.asyncio
    async def test_generate_quiz(self, client):
        with patch("ai_svc.routes.generate.get_gateway") as mock_gw:
            with patch("ai_svc.routes.generate.QuizGenerator") as MockGen:
                mock_gen = AsyncMock()
                mock_gen.generate = AsyncMock(return_value={"quiz_content": "Q1: ...", "quality_passed": True, "model": "m", "usage": {}})
                MockGen.return_value = mock_gen

                resp = await client.post("/ai/generate", json={
                    "session_type": "quiz",
                    "subject": "MATH",
                    "skills": ["fractions"],
                })
                assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_generate_activity(self, client):
        with patch("ai_svc.routes.generate.get_gateway") as mock_gw:
            with patch("ai_svc.routes.generate.ActivityGenerator") as MockGen:
                mock_gen = AsyncMock()
                mock_gen.generate = AsyncMock(return_value={"activity_guide": "...", "quality_passed": True, "model": "m", "usage": {}})
                MockGen.return_value = mock_gen

                resp = await client.post("/ai/generate", json={
                    "session_type": "activity",
                    "domain": "COMMUNICATION",
                })
                assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_generate_unknown_type(self, client):
        with patch("ai_svc.routes.generate.get_gateway"):
            resp = await client.post("/ai/generate", json={
                "session_type": "unknown_type",
            })
            assert resp.status_code == 200
            assert "error" in resp.json()


class TestTutorRoutes:
    @pytest.mark.asyncio
    async def test_tutor_respond(self, client):
        with patch("ai_svc.routes.tutor.get_gateway") as mock_gw:
            with patch("ai_svc.routes.tutor.TutorResponder") as MockResp:
                mock_resp = AsyncMock()
                mock_resp.respond = AsyncMock(return_value={
                    "response": "Great question! Let me explain...",
                    "persona": "nova",
                    "quality_passed": True,
                    "model": "test-model",
                    "usage": {},
                })
                MockResp.return_value = mock_resp

                resp = await client.post("/ai/tutor/respond", json={
                    "subject": "MATH",
                    "user_input": "What is 2+2?",
                })
                assert resp.status_code == 200
                assert "response" in resp.json()


class TestHomeworkRoutes:
    @pytest.mark.asyncio
    async def test_adapt_homework(self, client):
        with patch("ai_svc.routes.homework.get_gateway") as mock_gw:
            with patch("ai_svc.routes.homework.HomeworkAdapter") as MockAdapter:
                mock_adapter = AsyncMock()
                mock_adapter.adapt = AsyncMock(return_value={
                    "adapted_content": "Adapted homework...",
                    "quality_passed": True,
                    "model": "m",
                    "usage": {},
                })
                MockAdapter.return_value = mock_adapter

                resp = await client.post("/ai/homework/adapt", json={
                    "homework_text": "Solve: 3x + 5 = 20",
                    "subject": "MATH",
                })
                assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_homework_ocr(self, client):
        with patch("ai_svc.routes.homework.get_gateway") as mock_gw:
            with patch("ai_svc.routes.homework.OCRProcessor") as MockOCR:
                from ai_svc.vision.ocr_processor import HomeworkExtraction
                mock_ocr = AsyncMock()
                mock_ocr.process_image = AsyncMock(return_value=HomeworkExtraction(
                    printed_text="3+4=?", subject="MATH",
                ))
                MockOCR.return_value = mock_ocr

                resp = await client.post("/ai/homework/ocr", json={
                    "image_url": "https://example.com/hw.jpg",
                })
                assert resp.status_code == 200
                assert resp.json()["subject"] == "MATH"


class TestWritingRoutes:
    @pytest.mark.asyncio
    async def test_writing_feedback(self, client):
        with patch("ai_svc.routes.writing.get_gateway") as mock_gw:
            with patch("ai_svc.routes.writing.WritingFeedbackGenerator") as MockGen:
                mock_gen = AsyncMock()
                mock_gen.generate_feedback = AsyncMock(return_value={
                    "feedback": "Great effort! Your story...",
                    "quality_passed": True,
                    "model": "m",
                    "usage": {},
                })
                MockGen.return_value = mock_gen

                resp = await client.post("/ai/writing/feedback", json={
                    "submission": "My cat is nice. I like my cat.",
                    "prompt": "Write about your pet",
                })
                assert resp.status_code == 200
                assert "feedback" in resp.json()


class TestIEPRoutes:
    @pytest.mark.asyncio
    async def test_parse_iep_text(self, client):
        with patch("ai_svc.routes.iep.get_gateway") as mock_gw, \
             patch("ai_svc.routes.iep.publish_event", new_callable=AsyncMock):
            with patch("ai_svc.routes.iep.IEPParser") as MockParser:
                from ai_svc.iep.extractor import IEPExtraction
                mock_parser = AsyncMock()
                mock_parser.parse_text = AsyncMock(return_value=IEPExtraction(
                    disability_categories=["Autism"],
                    grade_level=3,
                ))
                MockParser.return_value = mock_parser

                resp = await client.post("/ai/iep/parse", json={
                    "learner_id": str(uuid.uuid4()),
                    "document_id": str(uuid.uuid4()),
                    "text_content": "Student has autism...",
                })
                assert resp.status_code == 200
                assert "Autism" in resp.json()["disability_categories"]

    @pytest.mark.asyncio
    async def test_parse_iep_no_content(self, client):
        with patch("ai_svc.routes.iep.get_gateway"):
            resp = await client.post("/ai/iep/parse", json={
                "learner_id": str(uuid.uuid4()),
                "document_id": str(uuid.uuid4()),
            })
            assert resp.status_code == 200
            assert "error" in resp.json()

    @pytest.mark.asyncio
    async def test_parse_iep_image(self, client):
        with patch("ai_svc.routes.iep.get_gateway") as mock_gw, \
             patch("ai_svc.routes.iep.publish_event", new_callable=AsyncMock):
            with patch("ai_svc.routes.iep.IEPParser") as MockParser:
                from ai_svc.iep.extractor import IEPExtraction
                mock_parser = AsyncMock()
                mock_parser.parse_image = AsyncMock(return_value=IEPExtraction(grade_level=5))
                MockParser.return_value = mock_parser

                resp = await client.post("/ai/iep/parse", json={
                    "learner_id": str(uuid.uuid4()),
                    "document_id": str(uuid.uuid4()),
                    "file_url": "https://example.com/iep.jpg",
                    "file_type": "image",
                })
                assert resp.status_code == 200


class TestQualityRoutes:
    @pytest.mark.asyncio
    async def test_validate_content(self, client):
        resp = await client.post("/ai/quality/validate", json={
            "content": "The cat sat on the mat. It was sunny.",
            "learner_context": {
                "enrolled_grade": 3,
                "functioning_level": "STANDARD",
                "delivery_levels": {"reading_level": "DEVELOPING"},
                "active_accommodations": [],
            },
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["passed"] is True
        assert len(data["gates"]) == 4

    @pytest.mark.asyncio
    async def test_validate_unsafe_content(self, client):
        resp = await client.post("/ai/quality/validate", json={
            "content": "What the hell is this?",
            "learner_context": {"enrolled_grade": 3, "functioning_level": "STANDARD", "delivery_levels": {}, "active_accommodations": []},
        })
        assert resp.status_code == 200
        assert resp.json()["passed"] is False
