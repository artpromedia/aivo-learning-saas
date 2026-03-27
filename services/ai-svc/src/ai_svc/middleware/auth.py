"""JWT authentication middleware — RS256 verification."""

from __future__ import annotations

import logging
from typing import Any

import jwt
from fastapi import HTTPException, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ai_svc.config import get_settings

logger = logging.getLogger(__name__)

_bearer_scheme = HTTPBearer()


def decode_token(token: str) -> dict[str, Any]:
    """Decode and verify a JWT token using the configured public key."""
    settings = get_settings()
    if not settings.jwt_public_key:
        raise HTTPException(status_code=500, detail="JWT public key not configured")
    try:
        payload = jwt.decode(
            token,
            settings.jwt_public_key,
            algorithms=[settings.jwt_algorithm],
            options={"verify_aud": False},
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")


async def require_auth(
    credentials: HTTPAuthorizationCredentials = Security(_bearer_scheme),
) -> dict[str, Any]:
    """FastAPI dependency that requires a valid JWT."""
    return decode_token(credentials.credentials)


async def optional_auth(request: Request) -> dict[str, Any] | None:
    """FastAPI dependency that optionally extracts JWT claims."""
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header[7:]
    try:
        return decode_token(token)
    except HTTPException:
        return None
