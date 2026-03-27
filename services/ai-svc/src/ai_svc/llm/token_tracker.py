"""Per-tenant token usage tracking and quota enforcement."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from ai_svc.config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class UsageResult:
    """Token usage check result."""
    allowed: bool
    tokens_used_today: int
    daily_quota: int
    at_soft_limit: bool
    remaining: int


@dataclass
class TokenUsage:
    """Recorded usage for a single LLM call."""
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    estimated_cost: float


class TokenTracker:
    """Tracks per-tenant LLM token usage against daily quotas."""

    async def check_quota(
        self,
        session: AsyncSession,
        tenant_id: str,
    ) -> UsageResult:
        """Check if tenant has remaining token quota for today."""
        settings = get_settings()

        # Get tenant config
        config_row = await session.execute(
            text(
                "SELECT daily_llm_token_quota FROM tenant_configs WHERE tenant_id = :tid"
            ),
            {"tid": tenant_id},
        )
        config = config_row.first()
        daily_quota = config.daily_llm_token_quota if config else 1_000_000

        # Get today's usage
        today = date.today().isoformat()
        usage_row = await session.execute(
            text(
                "SELECT tokens_used FROM tenant_usages "
                "WHERE tenant_id = :tid AND usage_date = :d"
            ),
            {"tid": tenant_id, "d": today},
        )
        usage = usage_row.first()
        tokens_used = usage.tokens_used if usage else 0

        soft_limit = int(daily_quota * settings.token_quota_soft_limit_percent / 100)
        remaining = max(0, daily_quota - tokens_used)
        at_soft = tokens_used >= soft_limit

        return UsageResult(
            allowed=tokens_used < daily_quota,
            tokens_used_today=tokens_used,
            daily_quota=daily_quota,
            at_soft_limit=at_soft,
            remaining=remaining,
        )

    async def record_usage(
        self,
        session: AsyncSession,
        tenant_id: str,
        usage: TokenUsage,
    ) -> None:
        """Record token usage for a tenant, atomically incrementing today's count."""
        today = date.today().isoformat()

        await session.execute(
            text(
                "INSERT INTO tenant_usages (id, tenant_id, usage_date, tokens_used, requests_count, created_at) "
                "VALUES (gen_random_uuid(), :tid, :d, :tokens, 1, NOW()) "
                "ON CONFLICT (tenant_id, usage_date) "
                "DO UPDATE SET tokens_used = tenant_usages.tokens_used + :tokens, "
                "requests_count = tenant_usages.requests_count + 1"
            ),
            {"tid": tenant_id, "d": today, "tokens": usage.total_tokens},
        )

    def estimate_cost(self, model: str, prompt_tokens: int, completion_tokens: int) -> float:
        """Estimate cost in USD for a model call."""
        # Approximate cost per 1M tokens (input / output)
        cost_map: dict[str, tuple[float, float]] = {
            "anthropic/claude-sonnet-4-20250514": (3.0, 15.0),
            "anthropic/claude-opus-4-20250514": (15.0, 75.0),
            "google/gemini-2.0-flash": (0.075, 0.30),
            "openai/gpt-4o": (2.5, 10.0),
        }

        in_cost, out_cost = cost_map.get(model, (1.0, 3.0))
        return (prompt_tokens * in_cost + completion_tokens * out_cost) / 1_000_000
