"""Application configuration loaded from environment variables."""

from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Server
    port: int = 3002
    host: str = "0.0.0.0"
    log_level: str = "info"

    # PostgreSQL
    database_url: str = "postgresql+asyncpg://aivo:aivo_dev@localhost:5432/aivo_dev"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # NATS
    nats_url: str = "nats://localhost:4222"

    # JWT (RS256 public key for verification only)
    jwt_public_key: str = ""
    jwt_algorithm: str = "RS256"

    # Brain cache
    brain_cache_ttl_seconds: int = 1800  # 30 minutes

    # Model storage
    model_store_dir: str = "/data/models"

    model_config = {"env_file": ".env", "extra": "ignore"}


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
