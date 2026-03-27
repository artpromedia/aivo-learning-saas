"""Tenant context middleware."""

from __future__ import annotations

from contextvars import ContextVar
from typing import Any

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

_tenant_ctx: ContextVar[dict[str, Any]] = ContextVar("tenant_ctx", default={})


def get_tenant() -> dict[str, Any]:
    """Get current tenant context."""
    return _tenant_ctx.get()


class TenantMiddleware(BaseHTTPMiddleware):
    """Extract tenant info from JWT claims and set context."""

    async def dispatch(self, request: Request, call_next):
        tenant: dict[str, Any] = {}
        # If auth was processed, claims are in request state
        if hasattr(request.state, "claims") and request.state.claims:
            claims = request.state.claims
            tenant = {
                "tenant_id": claims.get("tenant_id", claims.get("tenantId")),
                "user_id": claims.get("sub"),
                "role": claims.get("role"),
            }
        token = _tenant_ctx.set(tenant)
        try:
            response = await call_next(request)
            return response
        finally:
            _tenant_ctx.reset(token)
