"""Application configuration loaded from environment variables."""

from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Server
    port: int = 5000
    host: str = "0.0.0.0"
    log_level: str = "info"

    # PostgreSQL
    database_url: str = "postgresql+asyncpg://aivo:aivo_dev@localhost:5432/aivo_dev"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # NATS
    nats_url: str = "nats://localhost:4222"

    # JWT
    jwt_public_key: str = ""
    jwt_algorithm: str = "RS256"

    # LLM Provider API Keys
    anthropic_api_key: str = ""
    google_api_key: str = ""
    openai_api_key: str = ""

    # Tier model routing
    reasoning_model: str = "anthropic/claude-sonnet-4-20250514"
    reasoning_fallback_model: str = "google/gemini-2.0-flash"
    smart_model: str = "anthropic/claude-sonnet-4-20250514"
    smart_fallback_model: str = "google/gemini-2.0-flash"
    fast_model: str = "anthropic/claude-sonnet-4-20250514"
    fast_fallback_model: str = "google/gemini-2.0-flash"
    self_hosted_model: str = "ollama/llama3"

    # Vision AI
    vision_model: str = "google/gemini-2.0-flash"
    vision_fallback_model: str = "openai/gpt-4o"

    # IEP Parsing
    iep_parse_model: str = "anthropic/claude-sonnet-4-20250514"

    # Embeddings
    embedding_model: str = "text-embedding-3-small"

    # Brain Service
    brain_svc_url: str = "http://localhost:3002"

    # Token Quota
    token_quota_soft_limit_percent: int = 80

    # Langfuse
    langfuse_public_key: str = ""
    langfuse_secret_key: str = ""
    langfuse_host: str = "https://cloud.langfuse.com"

    model_config = {"env_file": ".env", "extra": "ignore"}


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
