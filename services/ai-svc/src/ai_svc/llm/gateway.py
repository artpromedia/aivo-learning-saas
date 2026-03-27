"""LiteLLM multi-provider gateway with tier-based routing and failover."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import Any

import litellm

from ai_svc.config import get_settings
from ai_svc.llm.failover import should_failover
from ai_svc.llm.tier_router import Tier, get_models_for_tier, tier_for_task
from ai_svc.llm.prompt_sanitizer import sanitize_messages

logger = logging.getLogger(__name__)


@dataclass
class LLMResponse:
    """Structured response from the LLM gateway."""
    content: str
    model: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    latency_ms: float = 0.0
    tier: str = ""
    finish_reason: str = ""
    raw_response: dict[str, Any] = field(default_factory=dict)


class LLMGateway:
    """Multi-provider LLM gateway with automatic failover."""

    def __init__(self) -> None:
        settings = get_settings()
        # Configure LiteLLM API keys
        if settings.anthropic_api_key:
            litellm.anthropic_key = settings.anthropic_api_key
        if settings.openai_api_key:
            litellm.openai_key = settings.openai_api_key
        if settings.google_api_key:
            litellm.google_key = settings.google_api_key

        # Disable LiteLLM's own logging noise
        litellm.suppress_debug_info = True

    async def generate(
        self,
        messages: list[dict[str, str]],
        task_type: str = "lesson_generation",
        tier: Tier | None = None,
        tenant_override: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        metadata: dict[str, Any] | None = None,
    ) -> LLMResponse:
        """Generate a completion using the appropriate tier with failover.

        Args:
            messages: OpenAI-format messages array.
            task_type: Task type for tier selection (used if tier is None).
            tier: Explicit tier override.
            tenant_override: Tenant-specific model override.
            temperature: Sampling temperature.
            max_tokens: Maximum completion tokens.
            metadata: Additional metadata for tracing.

        Returns:
            LLMResponse with content and usage stats.
        """
        selected_tier = tier or tier_for_task(task_type)
        models = get_models_for_tier(selected_tier, tenant_override)
        sanitized = sanitize_messages(messages)

        last_error: Exception | None = None
        for model_id in models:
            try:
                start = time.monotonic()
                response = await litellm.acompletion(
                    model=model_id,
                    messages=sanitized,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                elapsed_ms = (time.monotonic() - start) * 1000

                usage = response.usage or {}
                content = response.choices[0].message.content or ""

                return LLMResponse(
                    content=content,
                    model=model_id,
                    prompt_tokens=getattr(usage, "prompt_tokens", 0),
                    completion_tokens=getattr(usage, "completion_tokens", 0),
                    total_tokens=getattr(usage, "total_tokens", 0),
                    latency_ms=elapsed_ms,
                    tier=selected_tier.value,
                    finish_reason=response.choices[0].finish_reason or "",
                    raw_response=response.model_dump() if hasattr(response, "model_dump") else {},
                )
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "LLM call failed for model %s: %s. Attempting failover.",
                    model_id, exc,
                )
                if not should_failover(exc):
                    raise

        raise last_error or RuntimeError("All LLM providers failed")

    async def generate_with_vision(
        self,
        messages: list[dict[str, Any]],
        image_url: str | None = None,
        image_base64: str | None = None,
    ) -> LLMResponse:
        """Generate a completion with vision input (image)."""
        settings = get_settings()
        models = [settings.vision_model, settings.vision_fallback_model]

        # Build vision message
        content_parts: list[dict[str, Any]] = []
        for msg in messages:
            if msg["role"] == "user":
                content_parts.append({"type": "text", "text": msg["content"]})
                break

        if image_url:
            content_parts.append({
                "type": "image_url",
                "image_url": {"url": image_url},
            })
        elif image_base64:
            content_parts.append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
            })

        vision_messages = [
            {"role": "system", "content": messages[0]["content"]} if messages and messages[0]["role"] == "system" else None,
            {"role": "user", "content": content_parts},
        ]
        vision_messages = [m for m in vision_messages if m is not None]

        last_error: Exception | None = None
        for model_id in models:
            try:
                start = time.monotonic()
                response = await litellm.acompletion(
                    model=model_id,
                    messages=vision_messages,
                    max_tokens=4096,
                )
                elapsed_ms = (time.monotonic() - start) * 1000
                usage = response.usage or {}
                content = response.choices[0].message.content or ""

                return LLMResponse(
                    content=content,
                    model=model_id,
                    prompt_tokens=getattr(usage, "prompt_tokens", 0),
                    completion_tokens=getattr(usage, "completion_tokens", 0),
                    total_tokens=getattr(usage, "total_tokens", 0),
                    latency_ms=elapsed_ms,
                    tier="VISION",
                )
            except Exception as exc:
                last_error = exc
                logger.warning("Vision call failed for %s: %s", model_id, exc)
                if not should_failover(exc):
                    raise

        raise last_error or RuntimeError("All vision providers failed")
