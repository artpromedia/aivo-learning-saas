"""Feature flag client for ai-svc.

Reads feature flags from Redis using the same ff: key format as the admin-svc.
Uses mmh3 for consistent percentage bucketing (same algorithm as the TS client).
"""

from __future__ import annotations

import json
from typing import Any

import mmh3
import redis.asyncio as aioredis

REDIS_FLAG_PREFIX = "ff:"

_redis: aioredis.Redis | None = None


async def _get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        from ai_svc.config import get_settings

        settings = get_settings()
        _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
    return _redis


async def _get_flag_data(key: str, r: aioredis.Redis | None = None) -> dict[str, Any] | None:
    if r is None:
        r = await _get_redis()
    raw = await r.get(f"{REDIS_FLAG_PREFIX}{key}")
    if raw is None:
        return None
    parsed = json.loads(raw)
    if isinstance(parsed, dict) and "type" in parsed and "enabled" in parsed:
        return parsed
    return {
        "key": key,
        "type": "BOOLEAN",
        "defaultValue": parsed,
        "enabled": True,
    }


async def _get_override(key: str, tenant_id: str, r: aioredis.Redis | None = None) -> Any | None:
    if r is None:
        r = await _get_redis()
    raw = await r.get(f"{REDIS_FLAG_PREFIX}{key}:{tenant_id}")
    if raw is None:
        return None
    return json.loads(raw)


def _evaluate_flag(flag: dict[str, Any], tenant_id: str | None = None, override_value: Any = None) -> Any:
    if not flag.get("enabled", False):
        return False

    if override_value is not None:
        return override_value

    flag_type = flag.get("type", "BOOLEAN")
    default_value = flag.get("defaultValue")

    if flag_type == "BOOLEAN":
        return default_value

    if flag_type == "PERCENTAGE":
        if not tenant_id:
            return False
        hash_input = f"{flag['key']}:{tenant_id}"
        hash_value = mmh3.hash(hash_input, 0, signed=False)
        bucket = hash_value % 100
        threshold = default_value if isinstance(default_value, (int, float)) else 0
        return bucket < threshold

    if flag_type == "TENANT_LIST":
        if not tenant_id:
            return False
        tenant_list = default_value if isinstance(default_value, list) else []
        return tenant_id in tenant_list

    return False


async def is_enabled(key: str, tenant_id: str | None = None) -> bool:
    flag = await _get_flag_data(key)
    if flag is None:
        return False

    override_value = None
    if tenant_id:
        override_value = await _get_override(key, tenant_id)

    result = _evaluate_flag(flag, tenant_id, override_value)
    return bool(result)


async def get_value(key: str, tenant_id: str | None = None) -> Any:
    flag = await _get_flag_data(key)
    if flag is None:
        return False

    override_value = None
    if tenant_id:
        override_value = await _get_override(key, tenant_id)

    return _evaluate_flag(flag, tenant_id, override_value)
