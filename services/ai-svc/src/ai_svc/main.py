"""FastAPI application bootstrap."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from ai_svc.config import get_settings
from ai_svc.middleware.tenant import TenantMiddleware
from ai_svc.nats_client import close_nats, connect_nats
from ai_svc.observability import setup_observability, create_langfuse_handler
from ai_svc.llm.gateway import set_langfuse_client
from ai_svc.routes import all_routers

logger = logging.getLogger(__name__)

_langfuse_client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup & shutdown."""
    global _langfuse_client
    settings = get_settings()
    logging.basicConfig(level=settings.log_level.upper())
    logger.info("ai-svc starting on port %d", settings.port)

    _langfuse_client = create_langfuse_handler()
    if _langfuse_client:
        app.state.langfuse = _langfuse_client
        set_langfuse_client(_langfuse_client)
        logger.info("Langfuse observability initialized")
    else:
        app.state.langfuse = None
        logger.info("Langfuse not configured — LLM tracing disabled")

    try:
        await connect_nats()
        logger.info("NATS connection ready")
    except Exception:
        logger.warning("NATS connection failed — running without events", exc_info=True)

    yield

    logger.info("ai-svc shutting down")
    if _langfuse_client:
        try:
            _langfuse_client.flush()
        except Exception:
            logger.warning("Langfuse flush failed", exc_info=True)
    await close_nats()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="AIVO AI Generation Service",
        version="3.0.0",
        lifespan=lifespan,
    )

    from ai_svc.middleware.quota import QuotaEnforcementMiddleware

    setup_observability(app)
    app.add_middleware(QuotaEnforcementMiddleware)
    app.add_middleware(TenantMiddleware)

    for router in all_routers:
        app.include_router(router)

    return app


app = create_app()


def main() -> None:
    settings = get_settings()
    uvicorn.run(
        "ai_svc.main:app",
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level,
        reload=False,
    )


if __name__ == "__main__":
    main()
