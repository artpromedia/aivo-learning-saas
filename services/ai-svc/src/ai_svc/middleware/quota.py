"""Per-tenant LLM token quota enforcement middleware."""

from __future__ import annotations

import logging

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from ai_svc.middleware.tenant import get_tenant

logger = logging.getLogger(__name__)

QUOTA_EXEMPT_PATHS = {"/health", "/metrics", "/docs", "/openapi.json", "/redoc"}

LLM_GENERATING_PREFIXES = ("/generate", "/tutor", "/iep", "/vision", "/rag")


class QuotaEnforcementMiddleware(BaseHTTPMiddleware):
    """Check tenant's daily LLM token quota before allowing generation requests."""

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path in QUOTA_EXEMPT_PATHS:
            return await call_next(request)

        if request.method == "GET":
            return await call_next(request)

        if not any(request.url.path.startswith(p) for p in LLM_GENERATING_PREFIXES):
            return await call_next(request)

        tenant = get_tenant()
        tenant_id = tenant.get("tenant_id")
        if not tenant_id:
            return await call_next(request)

        try:
            from ai_svc.dependencies import get_token_tracker
            from ai_svc.db import get_session

            tracker = get_token_tracker()
            async with get_session() as session:
                result = await tracker.check_quota(session, tenant_id)

            if not result.allowed:
                logger.warning(
                    "Tenant %s exceeded daily token quota: %d/%d",
                    tenant_id,
                    result.tokens_used_today,
                    result.daily_quota,
                )
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "token_quota_exceeded",
                        "message": "Daily LLM token quota exceeded for this tenant.",
                        "tokens_used": result.tokens_used_today,
                        "daily_quota": result.daily_quota,
                    },
                )

            if result.at_soft_limit:
                logger.info(
                    "Tenant %s approaching token quota: %d/%d",
                    tenant_id,
                    result.tokens_used_today,
                    result.daily_quota,
                )
        except Exception:
            logger.debug("Quota check failed — allowing request", exc_info=True)

        return await call_next(request)
