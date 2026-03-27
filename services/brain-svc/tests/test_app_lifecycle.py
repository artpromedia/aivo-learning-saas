"""Tests for app lifecycle, model store edge cases, episodic memory edge cases."""

from __future__ import annotations

import json
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from brain_svc.ml.model_store import ModelStore
from brain_svc.services.episodic_memory import (
    archive_episodes,
    get_archived_episodes,
    read_recent_episodes,
)
from brain_svc.ml.difficulty_adapter import get_difficulty_for_step


class TestAppLifecycle:
    @pytest.mark.asyncio
    async def test_lifespan_startup_shutdown(self):
        """Test that lifespan properly starts up and shuts down."""
        with patch("brain_svc.main.get_settings") as mock_settings, \
             patch("brain_svc.main.connect_nats", new_callable=AsyncMock), \
             patch("brain_svc.events.subscribers.setup_subscriptions", new_callable=AsyncMock), \
             patch("brain_svc.main.close_nats", new_callable=AsyncMock) as mock_close_nats, \
             patch("brain_svc.main.close_redis", new_callable=AsyncMock) as mock_close_redis, \
             patch("brain_svc.main.dispose_engine", new_callable=AsyncMock) as mock_dispose:
            mock_settings.return_value.port = 3002
            mock_settings.return_value.log_level = "info"

            from brain_svc.main import lifespan
            app = MagicMock()
            async with lifespan(app):
                pass  # App is "running"

            mock_close_nats.assert_called_once()
            mock_close_redis.assert_called_once()
            mock_dispose.assert_called_once()

    @pytest.mark.asyncio
    async def test_lifespan_nats_failure_continues(self):
        """App should start even if NATS fails."""
        with patch("brain_svc.main.get_settings") as mock_settings, \
             patch("brain_svc.main.connect_nats", side_effect=Exception("NATS down")), \
             patch("brain_svc.main.close_nats", new_callable=AsyncMock), \
             patch("brain_svc.main.close_redis", new_callable=AsyncMock), \
             patch("brain_svc.main.dispose_engine", new_callable=AsyncMock):
            mock_settings.return_value.port = 3002
            mock_settings.return_value.log_level = "info"

            from brain_svc.main import lifespan
            app = MagicMock()
            async with lifespan(app):
                pass  # Should not raise

    def test_create_app(self):
        with patch("brain_svc.main.get_settings") as mock_settings:
            mock_settings.return_value.port = 3002
            mock_settings.return_value.log_level = "info"
            from brain_svc.main import create_app
            app = create_app()
            assert app.title == "AIVO Brain Service"

    def test_main_function(self):
        """Test that main() calls uvicorn.run."""
        with patch("brain_svc.main.uvicorn.run") as mock_run, \
             patch("brain_svc.main.get_settings") as mock_settings:
            mock_settings.return_value.host = "0.0.0.0"
            mock_settings.return_value.port = 3002
            mock_settings.return_value.log_level = "info"
            from brain_svc.main import main
            main()
            mock_run.assert_called_once()


class TestModelStoreEdgeCases:
    def test_load_nonexistent(self, tmp_path):
        store = ModelStore(str(tmp_path))
        result = store.load("nonexistent-learner")
        assert result is None

    def test_delete_nonexistent(self, tmp_path):
        store = ModelStore(str(tmp_path))
        store.delete("nonexistent-learner")  # Should not raise

    def test_export_nonexistent(self, tmp_path):
        store = ModelStore(str(tmp_path))
        result = store.export_to_bytes("nonexistent-learner")
        assert result is None

    def test_save_load_roundtrip(self, tmp_path):
        from brain_svc.ml.base_brain_model import BaseBrainModel
        from brain_svc.ml.mastery_engine import MasteryEngine

        store = ModelStore(str(tmp_path))
        model = BaseBrainModel()
        engine = MasteryEngine(model)
        learner_id = str(uuid.uuid4())

        store.save(learner_id, engine)
        # Clear cache to force disk load
        store.invalidate_cache(learner_id)
        loaded = store.load(learner_id)
        assert loaded is not None

    def test_export_to_bytes(self, tmp_path):
        from brain_svc.ml.base_brain_model import BaseBrainModel
        from brain_svc.ml.mastery_engine import MasteryEngine

        store = ModelStore(str(tmp_path))
        model = BaseBrainModel()
        engine = MasteryEngine(model)
        learner_id = str(uuid.uuid4())

        store.save(learner_id, engine)
        data = store.export_to_bytes(learner_id)
        assert data is not None
        assert len(data) > 0

    def test_cache_eviction(self, tmp_path):
        from brain_svc.ml.base_brain_model import BaseBrainModel
        from brain_svc.ml.mastery_engine import MasteryEngine
        import brain_svc.ml.model_store as mod
        old_max = mod._MAX_CACHE_SIZE
        mod._MAX_CACHE_SIZE = 2  # Set very small cache

        try:
            store = ModelStore(str(tmp_path))
            for i in range(5):
                model = BaseBrainModel()
                engine = MasteryEngine(model)
                store.save(f"learner-{i}", engine)
            assert len(store._cache) <= 2
        finally:
            mod._MAX_CACHE_SIZE = old_max


class TestEpisodicMemoryEdgeCases:
    @pytest.mark.asyncio
    async def test_read_recent_invalid_json(self):
        """Test handling of corrupted payload in stream."""
        mock_redis = AsyncMock()
        mock_redis.xrevrange = AsyncMock(return_value=[
            ("1-0", {"event_type": "TEST", "payload": "not-json{", "session_id": "", "timestamp": ""}),
        ])
        with patch("brain_svc.services.episodic_memory.get_redis", return_value=mock_redis):
            results = await read_recent_episodes("learner-1", count=10)
            assert len(results) == 1
            assert results[0]["payload"] == {}  # Falls back to empty dict

    @pytest.mark.asyncio
    async def test_archive_empty_stream(self):
        """Archiving with no entries returns 0."""
        mock_redis = AsyncMock()
        mock_redis.xrange = AsyncMock(return_value=[])
        session = AsyncMock()
        with patch("brain_svc.services.episodic_memory.get_redis", return_value=mock_redis):
            count = await archive_episodes(session, str(uuid.uuid4()), str(uuid.uuid4()))
            assert count == 0

    @pytest.mark.asyncio
    async def test_archive_with_entries(self):
        """Archiving moves entries from Redis to PostgreSQL."""
        mock_redis = AsyncMock()
        mock_redis.xrange = AsyncMock(return_value=[
            ("1-0", {"event_type": "TEST", "payload": '{"key":"val"}', "session_id": "s1"}),
            ("2-0", {"event_type": "UPDATE", "payload": "bad-json", "session_id": ""}),
        ])
        mock_redis.xdel = AsyncMock()
        session = AsyncMock()
        with patch("brain_svc.services.episodic_memory.get_redis", return_value=mock_redis):
            count = await archive_episodes(session, str(uuid.uuid4()), str(uuid.uuid4()))
            assert count == 2
            mock_redis.xdel.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_archived_with_event_type_filter(self):
        session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        session.execute = AsyncMock(return_value=mock_result)
        with patch("brain_svc.services.episodic_memory.uuid") as mock_uuid:
            mock_uuid.UUID = uuid.UUID
            episodes = await get_archived_episodes(
                session, str(uuid.uuid4()), event_type="MASTERY_UPDATE"
            )
            assert episodes == []


class TestDifficultyAdapterEdgeCases:
    def test_get_difficulty_for_step(self):
        from brain_svc.ml.difficulty_adapter import compute_difficulty_profile
        profile = compute_difficulty_profile(5, 0.6, "STANDARD")
        difficulty = get_difficulty_for_step(profile, step=2)
        assert 0.0 <= difficulty <= 1.0
