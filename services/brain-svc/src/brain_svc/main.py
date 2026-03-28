"""FastAPI application bootstrap."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI

from brain_svc.config import get_settings
from brain_svc.db import dispose_engine, get_engine
from brain_svc.middleware.tenant import TenantMiddleware
from brain_svc.nats_client import close_nats, connect_nats
from brain_svc.redis_client import close_redis
from brain_svc.routes import all_routers

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup & shutdown."""
    settings = get_settings()
    logging.basicConfig(level=settings.log_level.upper())
    logger.info("brain-svc starting on port %d", settings.port)

    # Auto-create tables (idempotent)
    from brain_svc.models import Base
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ensured")

    # Connect to NATS
    try:
        await connect_nats()
        from brain_svc.events.subscribers import setup_subscriptions
        await setup_subscriptions()
        logger.info("NATS subscriptions ready")
    except Exception:
        logger.warning("NATS connection failed — running without events", exc_info=True)

    yield

    # Shutdown
    logger.info("brain-svc shutting down")
    await close_nats()
    await close_redis()
    await dispose_engine()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="AIVO Brain Service",
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
        "brain_svc.main:app",
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level,
        reload=False,
    )


if __name__ == "__main__":
    main()
