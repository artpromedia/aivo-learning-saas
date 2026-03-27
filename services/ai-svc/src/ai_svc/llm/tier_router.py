"""Tier-based model routing — maps task complexity to model tiers."""

from __future__ import annotations

import enum
from dataclasses import dataclass
from typing import Any

from ai_svc.config import get_settings


class Tier(str, enum.Enum):
    REASONING = "REASONING"
    SMART = "SMART"
    FAST = "FAST"
    SELF_HOSTED = "SELF_HOSTED"


@dataclass
class TierConfig:
    primary: str
    fallback: str


def get_models_for_tier(
    tier: Tier,
    tenant_override: str | None = None,
) -> list[str]:
    """Return ordered list of models to try for the given tier.

    If tenant has an LLM provider override, that model is used first.
    """
    settings = get_settings()

    tier_configs: dict[Tier, TierConfig] = {
        Tier.REASONING: TierConfig(settings.reasoning_model, settings.reasoning_fallback_model),
        Tier.SMART: TierConfig(settings.smart_model, settings.smart_fallback_model),
        Tier.FAST: TierConfig(settings.fast_model, settings.fast_fallback_model),
        Tier.SELF_HOSTED: TierConfig(settings.self_hosted_model, settings.fast_fallback_model),
    }

    config = tier_configs.get(tier, tier_configs[Tier.SMART])
    models = [config.primary, config.fallback]

    if tenant_override:
        models.insert(0, tenant_override)

    # Deduplicate while preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for m in models:
        if m not in seen:
            seen.add(m)
            unique.append(m)
    return unique


# Task type → tier mapping
TASK_TIER_MAP: dict[str, Tier] = {
    "iep_parse": Tier.REASONING,
    "lesson_generation": Tier.SMART,
    "tutor_response": Tier.SMART,
    "homework_adapt": Tier.SMART,
    "writing_feedback": Tier.SMART,
    "quiz_generation": Tier.FAST,
    "safety_check": Tier.FAST,
    "activity_generation": Tier.SMART,
}


def tier_for_task(task_type: str) -> Tier:
    """Get the appropriate tier for a task type."""
    return TASK_TIER_MAP.get(task_type, Tier.SMART)
