"""Async SQLAlchemy engine and session factory."""

from __future__ import annotations

import re
from contextlib import asynccontextmanager
from typing import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from brain_svc.config import get_settings

_engine = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def _prepare_asyncpg_url(url: str) -> tuple[str, dict]:
    """Strip sslmode from URL and return (clean_url, connect_args).

    asyncpg does not accept sslmode as a query-string parameter;
    it must be passed via connect_args as ``ssl``.
    """
    connect_args: dict = {}
    match = re.search(r"[?&]sslmode=([^&]*)", url)
    if match:
        mode = match.group(1)
        url = re.sub(r"[?&]sslmode=[^&]*", "", url)
        if url.endswith("?"):
            url = url[:-1]
        if mode != "disable":
            import ssl as _ssl
            connect_args["ssl"] = _ssl.create_default_context()
            connect_args["ssl"].check_hostname = False
            connect_args["ssl"].verify_mode = _ssl.CERT_NONE
    return url, connect_args


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        url, connect_args = _prepare_asyncpg_url(settings.database_url)
        _engine = create_async_engine(
            url,
            echo=False,
            pool_size=20,
            max_overflow=10,
            connect_args=connect_args,
        )
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            get_engine(),
            expire_on_commit=False,
        )
    return _session_factory


@asynccontextmanager
async def get_session() -> AsyncIterator[AsyncSession]:
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def dispose_engine() -> None:
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _session_factory = None
