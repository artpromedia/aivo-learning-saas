"""Tests for auth and tenant middleware."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import jwt
import pytest
from fastapi import HTTPException

from brain_svc.middleware.auth import decode_token, optional_auth, require_auth
from brain_svc.middleware.tenant import TenantMiddleware, get_tenant, _tenant_ctx


class TestDecodeToken:
    def test_decode_valid_token(self):
        secret = "test-secret-key-for-hs256"
        payload = {"sub": "user-1", "role": "PARENT", "tenant_id": "t-1"}
        token = jwt.encode(payload, secret, algorithm="HS256")

        with patch("brain_svc.middleware.auth.get_settings") as mock_s:
            mock_s.return_value.jwt_public_key = secret
            mock_s.return_value.jwt_algorithm = "HS256"
            result = decode_token(token)
            assert result["sub"] == "user-1"
            assert result["role"] == "PARENT"

    def test_no_public_key_raises_500(self):
        with patch("brain_svc.middleware.auth.get_settings") as mock_s:
            mock_s.return_value.jwt_public_key = ""
            with pytest.raises(HTTPException) as exc_info:
                decode_token("some-token")
            assert exc_info.value.status_code == 500

    def test_expired_token_raises_401(self):
        import time
        secret = "test-secret"
        payload = {"sub": "user-1", "exp": int(time.time()) - 3600}
        token = jwt.encode(payload, secret, algorithm="HS256")

        with patch("brain_svc.middleware.auth.get_settings") as mock_s:
            mock_s.return_value.jwt_public_key = secret
            mock_s.return_value.jwt_algorithm = "HS256"
            with pytest.raises(HTTPException) as exc_info:
                decode_token(token)
            assert exc_info.value.status_code == 401
            assert "expired" in exc_info.value.detail.lower()

    def test_invalid_token_raises_401(self):
        with patch("brain_svc.middleware.auth.get_settings") as mock_s:
            mock_s.return_value.jwt_public_key = "test-secret"
            mock_s.return_value.jwt_algorithm = "HS256"
            with pytest.raises(HTTPException) as exc_info:
                decode_token("not.a.valid.token")
            assert exc_info.value.status_code == 401


class TestOptionalAuth:
    @pytest.mark.asyncio
    async def test_no_auth_header(self):
        request = MagicMock()
        request.headers.get.return_value = ""
        result = await optional_auth(request)
        assert result is None

    @pytest.mark.asyncio
    async def test_invalid_token_returns_none(self):
        request = MagicMock()
        request.headers.get.return_value = "Bearer invalid.token.here"
        with patch("brain_svc.middleware.auth.decode_token", side_effect=HTTPException(401, "bad")):
            result = await optional_auth(request)
            assert result is None

    @pytest.mark.asyncio
    async def test_valid_token(self):
        request = MagicMock()
        request.headers.get.return_value = "Bearer valid-token"
        claims = {"sub": "user-1", "role": "PARENT"}
        with patch("brain_svc.middleware.auth.decode_token", return_value=claims):
            result = await optional_auth(request)
            assert result == claims


class TestTenantMiddleware:
    @pytest.mark.asyncio
    async def test_get_tenant_default(self):
        result = get_tenant()
        assert isinstance(result, dict)

    @pytest.mark.asyncio
    async def test_middleware_sets_context(self):
        middleware = TenantMiddleware(app=MagicMock())
        request = MagicMock()
        request.state.claims = {
            "sub": "user-1",
            "tenant_id": "t-1",
            "role": "PARENT",
        }

        captured_tenant = {}

        async def call_next(req):
            captured_tenant.update(get_tenant())
            response = MagicMock()
            return response

        await middleware.dispatch(request, call_next)
        assert captured_tenant["tenant_id"] == "t-1"
        assert captured_tenant["user_id"] == "user-1"

    @pytest.mark.asyncio
    async def test_middleware_no_claims(self):
        middleware = TenantMiddleware(app=MagicMock())
        request = MagicMock(spec=["url", "method"])
        # No claims attribute
        del request.state

        # Use a simpler approach
        request2 = MagicMock()
        request2.state = MagicMock(spec=[])  # No 'claims' attribute

        async def call_next(req):
            return MagicMock()

        await middleware.dispatch(request2, call_next)
