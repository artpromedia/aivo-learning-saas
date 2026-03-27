"""Shared test fixtures for brain-svc."""

from __future__ import annotations

import asyncio
import os
import uuid
from datetime import datetime, timezone
from typing import Any, AsyncIterator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.dialects.postgresql import JSONB

# Force test config BEFORE any brain_svc imports
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")
os.environ.setdefault("NATS_URL", "nats://localhost:4222")
os.environ.setdefault("JWT_PUBLIC_KEY", "test-key")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("MODEL_STORE_DIR", "/tmp/brain-svc-test-models")

from brain_svc.config import Settings, get_settings
from brain_svc.models.brain_state import Base, BrainState
from brain_svc.models.episode import BrainEpisode
from brain_svc.models.functional import FunctionalMilestone, LearnerMilestone
from brain_svc.models.iep import IepDocument, IepGoal
from brain_svc.models.recommendation import Recommendation
from brain_svc.models.snapshot import BrainStateSnapshot


@compiles(JSONB, "sqlite")
def _compile_jsonb_for_sqlite(_type, _compiler, **_kw):
    return "JSON"


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def engine():
    # SQLite cannot parse PostgreSQL JSONB casts like "'{}'::jsonb".
    # Remove those server defaults in tests so metadata can be created.
    for table in Base.metadata.tables.values():
        for column in table.columns:
            if isinstance(column.type, JSONB) and column.server_default is not None:
                column.server_default = None

    eng = create_async_engine("sqlite+aiosqlite:///", echo=False)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await eng.dispose()


@pytest_asyncio.fixture
async def session(engine):
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as sess:
        yield sess


@pytest_asyncio.fixture
async def brain_state(session: AsyncSession) -> BrainState:
    """Create a sample brain state for testing."""
    bs = BrainState(
        learner_id=uuid.uuid4(),
        main_brain_version="aivo-brain-v3.0",
        seed_version="aivo-brain-v3.0",
        state={
            "mastery_levels": {"MATH": 0.5, "ELA": 0.3},
            "domain_scores": {"MATH": 0.5, "ELA": 0.3},
            "active_accommodations": ["extended_time"],
        },
        functioning_level_profile={
            "level": "STANDARD",
            "communication_mode": "VERBAL",
        },
        iep_profile={},
        active_tutors=[],
        delivery_levels={"reading_level": "DEVELOPING"},
        attention_span_minutes=30,
        cognitive_load="MEDIUM",
    )
    session.add(bs)
    await session.flush()
    return bs


@pytest.fixture
def mock_redis():
    """Mock Redis client."""
    redis_mock = AsyncMock()
    redis_mock.get = AsyncMock(return_value=None)
    redis_mock.set = AsyncMock()
    redis_mock.delete = AsyncMock()
    redis_mock.xadd = AsyncMock(return_value="1-0")
    redis_mock.xrevrange = AsyncMock(return_value=[])
    redis_mock.xrange = AsyncMock(return_value=[])
    redis_mock.xdel = AsyncMock()
    return redis_mock


@pytest.fixture
def mock_nats():
    """Mock NATS client."""
    js_mock = AsyncMock()
    js_mock.publish = AsyncMock()
    js_mock.subscribe = AsyncMock()
    js_mock.find_stream_name_by_subject = AsyncMock(return_value="AIVO_BRAIN")
    return js_mock


@pytest.fixture
def model_store(tmp_path):
    from brain_svc.ml.model_store import ModelStore
    return ModelStore(str(tmp_path))


@pytest.fixture
def test_settings():
    return Settings(
        database_url="sqlite+aiosqlite:///",
        redis_url="redis://localhost:6379",
        nats_url="nats://localhost:4222",
        jwt_public_key="test-key",
        jwt_algorithm="HS256",
        model_store_dir="/tmp/test-models",
    )


@pytest_asyncio.fixture
async def client():
    """Create test HTTP client with mocked auth."""
    # Patch JWT auth to always pass
    with patch("brain_svc.middleware.auth.decode_token") as mock_decode:
        mock_decode.return_value = {
            "sub": str(uuid.uuid4()),
            "role": "admin",
            "tenant_id": str(uuid.uuid4()),
        }
        # Patch Redis and NATS
        with patch("brain_svc.redis_client.get_redis") as mock_get_redis, \
             patch("brain_svc.nats_client.connect_nats") as mock_connect, \
             patch("brain_svc.nats_client.get_jetstream") as mock_get_js, \
             patch("brain_svc.events.subscribers.setup_subscriptions") as mock_subs:

            mock_redis = AsyncMock()
            mock_redis.get = AsyncMock(return_value=None)
            mock_redis.set = AsyncMock()
            mock_redis.delete = AsyncMock()
            mock_get_redis.return_value = mock_redis

            mock_js = AsyncMock()
            mock_get_js.return_value = mock_js
            mock_connect.return_value = (AsyncMock(), mock_js)
            mock_subs.return_value = None

            from brain_svc.main import create_app
            app = create_app()

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as ac:
                ac.headers["Authorization"] = "Bearer test-token"
                yield ac
