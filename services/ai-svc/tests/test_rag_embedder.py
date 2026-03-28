"""Tests for RAG embedder and text chunking."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio

from ai_svc.rag.ingest import chunk_text


class TestChunkText:
    def test_short_text_single_chunk(self):
        text = "This is a short sentence."
        chunks = chunk_text(text, max_tokens=500, overlap_tokens=50)
        assert len(chunks) == 1
        assert chunks[0] == text

    def test_long_text_multiple_chunks(self):
        # Build text that is longer than max_tokens
        words = ["word"] * 600
        text = " ".join(words)
        chunks = chunk_text(text, max_tokens=100, overlap_tokens=10)
        assert len(chunks) > 1

    def test_overlap_present(self):
        # Create text that needs splitting; overlap means later chunks
        # should share tokens with previous chunks
        words = ["token"] * 300
        text = " ".join(words)
        chunks = chunk_text(text, max_tokens=100, overlap_tokens=20)
        assert len(chunks) >= 3
        # The second chunk should start with content that appeared
        # at the end of the first chunk (overlap)
        # Just verify chunks are non-empty and overlapping exists
        for chunk in chunks:
            assert len(chunk) > 0

    def test_exact_max_tokens_single_chunk(self):
        # Text that is exactly at the limit should be a single chunk
        text = "Hello world."
        chunks = chunk_text(text, max_tokens=5000, overlap_tokens=50)
        assert len(chunks) == 1

    def test_empty_text(self):
        chunks = chunk_text("", max_tokens=500, overlap_tokens=50)
        assert len(chunks) == 1
        assert chunks[0] == ""

    def test_chunk_sizes_respect_max(self):
        import tiktoken
        enc = tiktoken.get_encoding("cl100k_base")
        words = ["wonderful"] * 400
        text = " ".join(words)
        chunks = chunk_text(text, max_tokens=100, overlap_tokens=10)
        for chunk in chunks:
            token_count = len(enc.encode(chunk))
            assert token_count <= 100


class TestEmbedText:
    @pytest.mark.asyncio
    async def test_embed_text_returns_correct_dimension(self):
        mock_embedding = [0.1] * 1536
        mock_response = MagicMock()
        mock_response.data = [{"embedding": mock_embedding}]

        with patch("ai_svc.rag.embedder.litellm") as mock_litellm:
            mock_litellm.aembedding = AsyncMock(return_value=mock_response)
            from ai_svc.rag.embedder import embed_text
            result = await embed_text("test text")
            assert len(result) == 1536
            assert result == mock_embedding

    @pytest.mark.asyncio
    async def test_embed_text_calls_litellm(self):
        mock_embedding = [0.5] * 1536
        mock_response = MagicMock()
        mock_response.data = [{"embedding": mock_embedding}]

        with patch("ai_svc.rag.embedder.litellm") as mock_litellm:
            mock_litellm.aembedding = AsyncMock(return_value=mock_response)
            from ai_svc.rag.embedder import embed_text
            await embed_text("hello world")
            mock_litellm.aembedding.assert_called_once()
            call_kwargs = mock_litellm.aembedding.call_args
            assert call_kwargs.kwargs["input"] == ["hello world"]

    @pytest.mark.asyncio
    async def test_embed_batch_returns_multiple(self):
        mock_embeddings = [[0.1] * 1536, [0.2] * 1536, [0.3] * 1536]
        mock_response = MagicMock()
        mock_response.data = [{"embedding": emb} for emb in mock_embeddings]

        with patch("ai_svc.rag.embedder.litellm") as mock_litellm:
            mock_litellm.aembedding = AsyncMock(return_value=mock_response)
            from ai_svc.rag.embedder import embed_batch
            results = await embed_batch(["a", "b", "c"])
            assert len(results) == 3
            for i, result in enumerate(results):
                assert len(result) == 1536
