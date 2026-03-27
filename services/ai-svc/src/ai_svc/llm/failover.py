"""Automatic failover logic — retry with secondary/tertiary on failures."""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

# HTTP status codes that trigger failover
FAILOVER_STATUS_CODES = {429, 500, 502, 503, 504}
FAILOVER_MAX_RETRIES = 2


def should_failover(error: Exception) -> bool:
    """Determine if an LLM error should trigger failover to next provider."""
    error_str = str(error).lower()
    if any(code_str in error_str for code_str in ["429", "rate_limit", "ratelimit"]):
        return True
    if any(code_str in error_str for code_str in ["500", "502", "503", "504", "timeout", "server_error"]):
        return True
    if "connection" in error_str or "unreachable" in error_str:
        return True
    return False


def build_failover_chain(models: list[str]) -> list[dict[str, Any]]:
    """Build a LiteLLM-compatible model list for router failover.

    Each entry in the chain is a dict with model_name and litellm_params.
    """
    chain = []
    for i, model in enumerate(models):
        chain.append({
            "model_name": f"tier-model-{i}",
            "litellm_params": {
                "model": model,
            },
        })
    return chain
