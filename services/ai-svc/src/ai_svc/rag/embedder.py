"""Text to vector embeddings via LiteLLM."""

from __future__ import annotations

import logging
from typing import Any

import litellm

from ai_svc.config import get_settings

logger = logging.getLogger(__name__)


async def embed_text(text: str) -> list[float]:
    """Generate an embedding vector for text."""
    settings = get_settings()
    response = await litellm.aembedding(
        model=settings.embedding_model,
        input=[text],
    )
    return response.data[0]["embedding"]


async def embed_batch(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a batch of texts."""
    settings = get_settings()
    response = await litellm.aembedding(
        model=settings.embedding_model,
        input=texts,
    )
    return [item["embedding"] for item in response.data]
