"""NATS JetStream client for event publishing."""

from __future__ import annotations

import json
import logging
from typing import Any

import nats
from nats.aio.client import Client as NatsClient
from nats.js import JetStreamContext

from ai_svc.config import get_settings

logger = logging.getLogger(__name__)

_nc: NatsClient | None = None
_js: JetStreamContext | None = None


async def connect_nats() -> tuple[NatsClient, JetStreamContext]:
    global _nc, _js
    if _nc is None or _nc.is_closed:
        settings = get_settings()
        _nc = await nats.connect(settings.nats_url)
        _js = _nc.jetstream()
        logger.info("Connected to NATS at %s", settings.nats_url)
    assert _js is not None
    return _nc, _js


async def get_jetstream() -> JetStreamContext:
    _, js = await connect_nats()
    return js


async def publish_event(subject: str, data: dict[str, Any]) -> None:
    js = await get_jetstream()
    payload = json.dumps(data).encode()
    await js.publish(subject, payload)
    logger.debug("Published event to %s", subject)


async def close_nats() -> None:
    global _nc, _js
    if _nc is not None and not _nc.is_closed:
        await _nc.drain()
        _nc = None
        _js = None
