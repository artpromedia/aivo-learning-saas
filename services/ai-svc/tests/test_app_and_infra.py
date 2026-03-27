"""Tests for app lifecycle, config, DB, NATS, middleware, dependencies, rate limiter."""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import jwt
import pytest
from fastapi import HTTPException

from ai_svc.config import Settings, get_settings
from ai_svc.middleware.auth import decode_token, optional_auth
from ai_svc.middleware.tenant import TenantMiddleware, get_tenant
from ai_svc.middleware.rate_limit import check_rate_limit
from ai_svc.dependencies import get_gateway, get_token_tracker


class TestConfig:
    def test_defaults(self):
        s = Settings(
            database_url="sqlite:///",
            redis_url="redis://localhost",
            nats_url="nats://localhost",
        )
        assert s.port == 5000
        assert s.host == "0.0.0.0"
        assert s.token_quota_soft_limit_percent == 80

    def test_get_settings_singleton(self):
        import ai_svc.config as mod
        mod._settings = None
        s1 = get_settings()
        s2 = get_settings()
        assert s1 is s2
        mod._settings = None


class TestAuth:
    def test_decode_valid_token(self):
        secret = "test-secret-key-for-testing-32ch"
        payload = {"sub": "user-1", "role": "PARENT"}
        token = jwt.encode(payload, secret, algorithm="HS256")

        with patch("ai_svc.middleware.auth.get_settings") as mock_s:
            mock_s.return_value.jwt_public_key = secret
            mock_s.return_value.jwt_algorithm = "HS256"
            result = decode_token(token)
            assert result["sub"] == "user-1"

    def test_no_key_500(self):
        with patch("ai_svc.middleware.auth.get_settings") as mock_s:
            mock_s.return_value.jwt_public_key = ""
            with pytest.raises(HTTPException) as exc:
                decode_token("token")
            assert exc.value.status_code == 500

    def test_expired_401(self):
        import time
        secret = "test-secret-key-for-testing-32ch"
        token = jwt.encode({"sub": "u", "exp": int(time.time()) - 3600}, secret, algorithm="HS256")
        with patch("ai_svc.middleware.auth.get_settings") as mock_s:
            mock_s.return_value.jwt_public_key = secret
            mock_s.return_value.jwt_algorithm = "HS256"
            with pytest.raises(HTTPException) as exc:
                decode_token(token)
            assert exc.value.status_code == 401

    def test_invalid_401(self):
        with patch("ai_svc.middleware.auth.get_settings") as mock_s:
            mock_s.return_value.jwt_public_key = "key"
            mock_s.return_value.jwt_algorithm = "HS256"
            with pytest.raises(HTTPException) as exc:
                decode_token("not.valid.token")
            assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_optional_auth_no_header(self):
        request = MagicMock()
        request.headers.get.return_value = ""
        assert await optional_auth(request) is None

    @pytest.mark.asyncio
    async def test_optional_auth_invalid(self):
        request = MagicMock()
        request.headers.get.return_value = "Bearer invalid"
        with patch("ai_svc.middleware.auth.decode_token", side_effect=HTTPException(401, "bad")):
            assert await optional_auth(request) is None


class TestTenantMiddleware:
    @pytest.mark.asyncio
    async def test_sets_context(self):
        mw = TenantMiddleware(app=MagicMock())
        request = MagicMock()
        request.state.claims = {"sub": "u1", "tenant_id": "t1", "role": "PARENT"}

        captured = {}
        async def call_next(req):
            captured.update(get_tenant())
            return MagicMock()

        await mw.dispatch(request, call_next)
        assert captured["tenant_id"] == "t1"

    @pytest.mark.asyncio
    async def test_no_claims(self):
        mw = TenantMiddleware(app=MagicMock())
        request = MagicMock()
        request.state = MagicMock(spec=[])

        async def call_next(req):
            return MagicMock()

        await mw.dispatch(request, call_next)


class TestRateLimiter:
    @pytest.mark.asyncio
    async def test_under_limit(self):
        mock_pipe = MagicMock()
        mock_pipe.zremrangebyscore = MagicMock(return_value=mock_pipe)
        mock_pipe.zcard = MagicMock(return_value=mock_pipe)
        mock_pipe.zadd = MagicMock(return_value=mock_pipe)
        mock_pipe.expire = MagicMock(return_value=mock_pipe)
        mock_pipe.execute = AsyncMock(return_value=[None, 5, None, None])
        mock_redis = MagicMock()
        mock_redis.pipeline.return_value = mock_pipe

        allowed, remaining = await check_rate_limit(mock_redis, "tenant-1")
        assert allowed
        assert remaining > 0

    @pytest.mark.asyncio
    async def test_over_limit(self):
        mock_pipe = MagicMock()
        mock_pipe.zremrangebyscore = MagicMock(return_value=mock_pipe)
        mock_pipe.zcard = MagicMock(return_value=mock_pipe)
        mock_pipe.zadd = MagicMock(return_value=mock_pipe)
        mock_pipe.expire = MagicMock(return_value=mock_pipe)
        mock_pipe.execute = AsyncMock(return_value=[None, 100, None, None])
        mock_redis = MagicMock()
        mock_redis.pipeline.return_value = mock_pipe

        allowed, remaining = await check_rate_limit(mock_redis, "tenant-1", limit=50)
        assert not allowed


class TestDependencies:
    def test_get_gateway(self):
        import ai_svc.dependencies as mod
        mod._gateway = None
        gw1 = get_gateway()
        gw2 = get_gateway()
        assert gw1 is gw2
        mod._gateway = None

    def test_get_token_tracker(self):
        import ai_svc.dependencies as mod
        mod._token_tracker = None
        tt1 = get_token_tracker()
        tt2 = get_token_tracker()
        assert tt1 is tt2
        mod._token_tracker = None


class TestAppLifecycle:
    @pytest.mark.asyncio
    async def test_lifespan(self):
        with patch("ai_svc.main.get_settings") as mock_s, \
             patch("ai_svc.main.connect_nats", new_callable=AsyncMock), \
             patch("ai_svc.main.close_nats", new_callable=AsyncMock) as mock_close:
            mock_s.return_value.port = 5000
            mock_s.return_value.log_level = "info"

            from ai_svc.main import lifespan
            async with lifespan(MagicMock()):
                pass
            mock_close.assert_called_once()

    @pytest.mark.asyncio
    async def test_lifespan_nats_failure(self):
        with patch("ai_svc.main.get_settings") as mock_s, \
             patch("ai_svc.main.connect_nats", side_effect=Exception("fail")), \
             patch("ai_svc.main.close_nats", new_callable=AsyncMock):
            mock_s.return_value.port = 5000
            mock_s.return_value.log_level = "info"

            from ai_svc.main import lifespan
            async with lifespan(MagicMock()):
                pass  # Should not raise

    def test_create_app(self):
        from ai_svc.main import create_app
        app = create_app()
        assert app.title == "AIVO AI Generation Service"

    def test_main_function(self):
        with patch("ai_svc.main.uvicorn.run") as mock_run, \
             patch("ai_svc.main.get_settings") as mock_s:
            mock_s.return_value.host = "0.0.0.0"
            mock_s.return_value.port = 5000
            mock_s.return_value.log_level = "info"
            from ai_svc.main import main
            main()
            mock_run.assert_called_once()


class TestDBModule:
    def test_get_engine(self):
        import ai_svc.db as mod
        mod._engine = None
        mod._session_factory = None
        with patch("ai_svc.db.get_settings") as mock_s:
            mock_s.return_value.database_url = "sqlite+aiosqlite:///"
            with patch("ai_svc.db.create_async_engine") as mock_create:
                mock_engine = MagicMock()
                mock_create.return_value = mock_engine
                eng = mod.get_engine()
                assert eng is mock_engine
                eng2 = mod.get_engine()
                assert eng is eng2
        mod._engine = None
        mod._session_factory = None

    def test_get_session_factory(self):
        import ai_svc.db as mod
        mod._engine = None
        mod._session_factory = None
        with patch("ai_svc.db.get_engine") as mock_eng:
            mock_eng.return_value = MagicMock()
            sf = mod.get_session_factory()
            assert sf is not None
        mod._engine = None
        mod._session_factory = None

    @pytest.mark.asyncio
    async def test_dispose_engine(self):
        import ai_svc.db as mod
        mod._engine = None
        mod._session_factory = None
        await mod.dispose_engine()
        assert mod._engine is None


class TestNatsModule:
    @pytest.mark.asyncio
    async def test_close_nats_when_none(self):
        import ai_svc.nats_client as mod
        mod._nc = None
        mod._js = None
        await mod.close_nats()
