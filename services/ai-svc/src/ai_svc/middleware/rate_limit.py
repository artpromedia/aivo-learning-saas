"""Per-tenant rate limiting via Redis sliding window."""

from __future__ import annotations

import logging
import time
from typing import Any

logger = logging.getLogger(__name__)

DEFAULT_REQUESTS_PER_MINUTE = 60
WINDOW_SECONDS = 60


async def check_rate_limit(
    redis_client: Any,
    tenant_id: str,
    limit: int = DEFAULT_REQUESTS_PER_MINUTE,
) -> tuple[bool, int]:
    """Check if tenant is within rate limit.

    Returns (allowed, remaining_requests).
    """
    key = f"rate_limit:{tenant_id}"
    now = time.time()
    window_start = now - WINDOW_SECONDS

    pipe = redis_client.pipeline()
    pipe.zremrangebyscore(key, 0, window_start)
    pipe.zcard(key)
    pipe.zadd(key, {str(now): now})
    pipe.expire(key, WINDOW_SECONDS + 1)
    results = await pipe.execute()

    current_count = results[1]
    remaining = max(0, limit - current_count - 1)
    allowed = current_count < limit
    return allowed, remaining
