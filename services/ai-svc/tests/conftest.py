"""Shared test fixtures for ai-svc."""

from __future__ import annotations

import asyncio
import os
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Force test config BEFORE any ai_svc imports
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("NATS_URL", "nats://localhost:4222")
os.environ.setdefault("JWT_PUBLIC_KEY", "test-key")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")
os.environ.setdefault("OPENAI_API_KEY", "test-key")
os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from ai_svc.config import Settings


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_settings():
    return Settings(
        database_url="sqlite+aiosqlite:///",
        redis_url="redis://localhost:6379",
        nats_url="nats://localhost:4222",
        jwt_public_key="test-key",
        jwt_algorithm="HS256",
    )


@pytest.fixture
def mock_llm_response():
    """Create a mock LiteLLM response."""
    from ai_svc.llm.gateway import LLMResponse
    return LLMResponse(
        content="Generated test content.",
        model="test-model",
        prompt_tokens=100,
        completion_tokens=50,
        total_tokens=150,
        latency_ms=500.0,
        tier="SMART",
    )


@pytest.fixture
def sample_learner_context():
    return {
        "enrolled_grade": 3,
        "functioning_level": "STANDARD",
        "communication_mode": "VERBAL",
        "preferred_modality": "VISUAL",
        "attention_span": 30,
        "cognitive_load": "MEDIUM",
        "delivery_levels": {"reading_level": "DEVELOPING"},
        "active_accommodations": [],
        "mastery_levels": {"MATH": 0.5, "ELA": 0.3},
        "iep_goals": [],
        "active_tutors": [],
    }


@pytest.fixture
def low_verbal_context():
    return {
        "enrolled_grade": 2,
        "functioning_level": "LOW_VERBAL",
        "communication_mode": "LIMITED_VERBAL",
        "preferred_modality": "VISUAL",
        "attention_span": 15,
        "cognitive_load": "LOW",
        "delivery_levels": {"reading_level": "EARLY"},
        "active_accommodations": [
            "extended_time", "text_to_speech", "picture_support",
            "reduced_choices", "chunked_text",
        ],
        "mastery_levels": {"MATH": 0.2},
        "iep_goals": [{"domain": "MATH", "goal_text": "Count to 10"}],
        "active_tutors": [],
    }


@pytest_asyncio.fixture
async def client():
    """Create test HTTP client with mocked auth."""
    with patch("ai_svc.middleware.auth.decode_token") as mock_decode:
        mock_decode.return_value = {
            "sub": str(uuid.uuid4()),
            "role": "admin",
            "tenant_id": str(uuid.uuid4()),
        }
        with patch("ai_svc.nats_client.connect_nats") as mock_connect, \
             patch("ai_svc.nats_client.get_jetstream") as mock_get_js:
            mock_js = AsyncMock()
            mock_get_js.return_value = mock_js
            mock_connect.return_value = (AsyncMock(), mock_js)

            from ai_svc.main import create_app
            app = create_app()

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                ac.headers["Authorization"] = "Bearer test-token"
                yield ac
