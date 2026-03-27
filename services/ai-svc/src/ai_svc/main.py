"""FastAPI application bootstrap."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from ai_svc.config import get_settings
from ai_svc.middleware.tenant import TenantMiddleware
from ai_svc.nats_client import close_nats, connect_nats
from ai_svc.routes import all_routers

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup & shutdown."""
    settings = get_settings()
    logging.basicConfig(level=settings.log_level.upper())
    logger.info("ai-svc starting on port %d", settings.port)

    try:
        await connect_nats()
        logger.info("NATS connection ready")
    except Exception:
        logger.warning("NATS connection failed — running without events", exc_info=True)

    yield

    logger.info("ai-svc shutting down")
    await close_nats()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="AIVO AI Generation Service",
        version="3.0.0",
        lifespan=lifespan,
    )

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
