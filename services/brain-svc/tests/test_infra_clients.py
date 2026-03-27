"""Tests for infrastructure clients and persistence helpers."""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from brain_svc.config import Settings
from brain_svc.db import dispose_engine, get_engine, get_session, get_session_factory
from brain_svc.ml.base_brain_model import BaseBrainModel
from brain_svc.ml.mastery_engine import MasteryEngine
from brain_svc.ml.model_store import ModelStore
from brain_svc.nats_client import close_nats, connect_nats, get_jetstream, publish_event
from brain_svc.redis_client import close_redis, get_redis


class TestDbModule:
    def teardown_method(self):
        import brain_svc.db as db_mod

        db_mod._engine = None
        db_mod._session_factory = None

    def test_get_engine_singleton(self):
        import brain_svc.db as db_mod

        fake_engine = object()
        with patch("brain_svc.db.get_settings", return_value=Settings(database_url="sqlite+aiosqlite:///")):
            with patch("brain_svc.db.create_async_engine", return_value=fake_engine) as mock_create:
                e1 = get_engine()
                e2 = get_engine()

        assert e1 is fake_engine
        assert e2 is fake_engine
        assert mock_create.call_count == 1

    def test_get_session_factory_singleton(self):
        import brain_svc.db as db_mod

        fake_factory = object()
        with patch("brain_svc.db.get_engine", return_value=object()):
            with patch("brain_svc.db.async_sessionmaker", return_value=fake_factory) as mock_maker:
                f1 = get_session_factory()
                f2 = get_session_factory()

        assert f1 is fake_factory
        assert f2 is fake_factory
        assert mock_maker.call_count == 1

    @pytest.mark.asyncio
    async def test_get_session_commit_path(self):
        class DummyCM:
            def __init__(self, session):
                self.session = session

            async def __aenter__(self):
                return self.session

            async def __aexit__(self, exc_type, exc, tb):
                return False

        session = AsyncMock()
        factory = MagicMock(return_value=DummyCM(session))

        with patch("brain_svc.db.get_session_factory", return_value=factory):
            async with get_session() as s:
                assert s is session

        session.commit.assert_awaited_once()
        session.rollback.assert_not_awaited()

    @pytest.mark.asyncio
    async def test_get_session_rollback_path(self):
        class DummyCM:
            def __init__(self, session):
                self.session = session

            async def __aenter__(self):
                return self.session

            async def __aexit__(self, exc_type, exc, tb):
                return False

        session = AsyncMock()
        factory = MagicMock(return_value=DummyCM(session))

        with patch("brain_svc.db.get_session_factory", return_value=factory):
            with pytest.raises(RuntimeError, match="boom"):
                async with get_session():
                    raise RuntimeError("boom")

        session.rollback.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_dispose_engine(self):
        import brain_svc.db as db_mod

        fake_engine = AsyncMock()
        db_mod._engine = fake_engine
        db_mod._session_factory = object()

        await dispose_engine()

        fake_engine.dispose.assert_awaited_once()
        assert db_mod._engine is None
        assert db_mod._session_factory is None


class TestRedisClient:
    def teardown_method(self):
        import brain_svc.redis_client as redis_mod

        redis_mod._redis = None

    @pytest.mark.asyncio
    async def test_get_redis_singleton(self):
        fake = AsyncMock()
        with patch("brain_svc.redis_client.redis.from_url", return_value=fake) as mock_from_url:
            r1 = await get_redis()
            r2 = await get_redis()

        assert r1 is fake
        assert r2 is fake
        assert mock_from_url.call_count == 1

    @pytest.mark.asyncio
    async def test_close_redis(self):
        import brain_svc.redis_client as redis_mod

        fake = AsyncMock()
        redis_mod._redis = fake

        await close_redis()

        fake.aclose.assert_awaited_once()
        assert redis_mod._redis is None


class TestNatsClient:
    def teardown_method(self):
        import brain_svc.nats_client as nats_mod

        nats_mod._nc = None
        nats_mod._js = None

    @pytest.mark.asyncio
    async def test_connect_and_get_jetstream(self):
        fake_js = AsyncMock()
        fake_nc = AsyncMock()
        fake_nc.is_closed = False
        fake_nc.jetstream = MagicMock(return_value=fake_js)

        with patch("brain_svc.nats_client.nats.connect", new=AsyncMock(return_value=fake_nc)) as mock_connect:
            nc, js = await connect_nats()
            js2 = await get_jetstream()

        assert nc is fake_nc
        assert js is fake_js
        assert js2 is fake_js
        mock_connect.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_publish_event(self):
        fake_js = AsyncMock()
        with patch("brain_svc.nats_client.get_jetstream", new=AsyncMock(return_value=fake_js)):
            await publish_event("brain.test", {"ok": True})

        fake_js.publish.assert_awaited_once()
        args, _ = fake_js.publish.await_args
        assert args[0] == "brain.test"
        assert json.loads(args[1].decode()) == {"ok": True}

    @pytest.mark.asyncio
    async def test_close_nats(self):
        import brain_svc.nats_client as nats_mod

        fake_nc = AsyncMock()
        fake_nc.is_closed = False
        nats_mod._nc = fake_nc
        nats_mod._js = AsyncMock()

        await close_nats()

        fake_nc.drain.assert_awaited_once()
        assert nats_mod._nc is None
        assert nats_mod._js is None


class TestModelStoreExtras:
    def test_load_missing_returns_none(self, tmp_path):
        store = ModelStore(str(tmp_path))
        assert store.load("missing") is None

    def test_save_load_delete_and_export(self, tmp_path):
        store = ModelStore(str(tmp_path))
        learner_id = "learner-1"
        engine = MasteryEngine(BaseBrainModel())

        store.save(learner_id, engine)

        from_cache = store.load(learner_id)
        assert from_cache is not None

        store.invalidate_cache(learner_id)
        from_disk = store.load(learner_id)
        assert from_disk is not None

        exported = store.export_to_bytes(learner_id)
        assert exported is not None
        assert len(exported) > 0

        store.delete(learner_id)
        assert store.load(learner_id) is None

    def test_clone_seed(self, tmp_path):
        store = ModelStore(str(tmp_path))
        seed = MasteryEngine(BaseBrainModel())

        cloned = store.clone_seed("learner-2", seed)

        assert cloned is not seed
        assert store.load("learner-2") is not None
