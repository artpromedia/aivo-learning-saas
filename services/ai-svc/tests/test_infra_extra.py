"""Extra tests for NATS, token tracker, readability, embedder, IEP routes edge cases."""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


class TestNatsClient:
    @pytest.mark.asyncio
    async def test_connect_and_get_jetstream(self):
        import ai_svc.nats_client as mod
        mod._nc = None
        mod._js = None
        with patch("ai_svc.nats_client.nats") as mock_nats:
            mock_nc = MagicMock()
            mock_nc.is_closed = False
            mock_js = MagicMock()
            mock_nc.jetstream.return_value = mock_js
            mock_nats.connect = AsyncMock(return_value=mock_nc)
            nc, js = await mod.connect_nats()
            assert js is mock_js
            # Second call reuses
            nc2, js2 = await mod.connect_nats()
            assert js2 is mock_js
        mod._nc = None
        mod._js = None

    @pytest.mark.asyncio
    async def test_publish_event(self):
        import ai_svc.nats_client as mod
        mod._nc = None
        mod._js = None
        with patch("ai_svc.nats_client.nats") as mock_nats:
            mock_nc = MagicMock()
            mock_nc.is_closed = False
            mock_js = AsyncMock()
            mock_nc.jetstream.return_value = mock_js
            mock_nats.connect = AsyncMock(return_value=mock_nc)
            await mod.publish_event("aivo.test", {"key": "value"})
            mock_js.publish.assert_called_once()
        mod._nc = None
        mod._js = None

    @pytest.mark.asyncio
    async def test_close_nats_active(self):
        import ai_svc.nats_client as mod
        mock_nc = AsyncMock()
        mock_nc.is_closed = False
        mod._nc = mock_nc
        mod._js = MagicMock()
        await mod.close_nats()
        mock_nc.drain.assert_called_once()
        assert mod._nc is None


class TestTokenTracker:
    @pytest.mark.asyncio
    async def test_check_quota_allowed(self):
        from ai_svc.llm.token_tracker import TokenTracker

        mock_session = AsyncMock()
        # Config result
        config_result = MagicMock()
        config_row = MagicMock()
        config_row.daily_llm_token_quota = 1_000_000
        config_result.first.return_value = config_row
        # Usage result
        usage_result = MagicMock()
        usage_row = MagicMock()
        usage_row.tokens_used = 100_000
        usage_result.first.return_value = usage_row

        mock_session.execute = AsyncMock(side_effect=[config_result, usage_result])

        tracker = TokenTracker()
        result = await tracker.check_quota(mock_session, "tenant-1")
        assert result.allowed
        assert result.remaining == 900_000
        assert not result.at_soft_limit

    @pytest.mark.asyncio
    async def test_check_quota_exceeded(self):
        from ai_svc.llm.token_tracker import TokenTracker

        mock_session = AsyncMock()
        config_result = MagicMock()
        config_row = MagicMock()
        config_row.daily_llm_token_quota = 100_000
        config_result.first.return_value = config_row

        usage_result = MagicMock()
        usage_row = MagicMock()
        usage_row.tokens_used = 150_000
        usage_result.first.return_value = usage_row

        mock_session.execute = AsyncMock(side_effect=[config_result, usage_result])

        tracker = TokenTracker()
        result = await tracker.check_quota(mock_session, "tenant-1")
        assert not result.allowed
        assert result.remaining == 0

    @pytest.mark.asyncio
    async def test_check_quota_at_soft_limit(self):
        from ai_svc.llm.token_tracker import TokenTracker

        mock_session = AsyncMock()
        config_result = MagicMock()
        config_row = MagicMock()
        config_row.daily_llm_token_quota = 100_000
        config_result.first.return_value = config_row

        usage_result = MagicMock()
        usage_row = MagicMock()
        usage_row.tokens_used = 85_000
        usage_result.first.return_value = usage_row

        mock_session.execute = AsyncMock(side_effect=[config_result, usage_result])

        tracker = TokenTracker()
        result = await tracker.check_quota(mock_session, "tenant-1")
        assert result.allowed
        assert result.at_soft_limit

    @pytest.mark.asyncio
    async def test_check_quota_no_config(self):
        from ai_svc.llm.token_tracker import TokenTracker

        mock_session = AsyncMock()
        config_result = MagicMock()
        config_result.first.return_value = None
        usage_result = MagicMock()
        usage_result.first.return_value = None

        mock_session.execute = AsyncMock(side_effect=[config_result, usage_result])

        tracker = TokenTracker()
        result = await tracker.check_quota(mock_session, "tenant-1")
        assert result.allowed
        assert result.daily_quota == 1_000_000

    @pytest.mark.asyncio
    async def test_record_usage(self):
        from ai_svc.llm.token_tracker import TokenTracker, TokenUsage

        mock_session = AsyncMock()
        tracker = TokenTracker()
        usage = TokenUsage(prompt_tokens=100, completion_tokens=50, total_tokens=150, estimated_cost=0.001)
        await tracker.record_usage(mock_session, "tenant-1", usage)
        mock_session.execute.assert_called_once()


class TestReadabilityGatePyphen:
    def test_syllable_count_with_pyphen(self):
        from ai_svc.quality_gate.readability_gate import _count_syllables
        # pyphen is available, so this should use it
        count = _count_syllables("beautiful")
        assert count >= 2

    def test_flesch_kincaid_moderate(self):
        from ai_svc.quality_gate.readability_gate import _flesch_kincaid_grade
        text = "The students worked together on their project. They learned many things about animals."
        grade = _flesch_kincaid_grade(text)
        assert 0 < grade < 12


class TestEmbedder:
    @pytest.mark.asyncio
    async def test_embed_text(self):
        with patch("ai_svc.rag.embedder.litellm") as mock_llm:
            mock_response = MagicMock()
            mock_response.data = [{"embedding": [0.1, 0.2, 0.3]}]
            mock_llm.aembedding = AsyncMock(return_value=mock_response)

            from ai_svc.rag.embedder import embed_text
            result = await embed_text("test sentence")
            assert result == [0.1, 0.2, 0.3]

    @pytest.mark.asyncio
    async def test_embed_batch(self):
        with patch("ai_svc.rag.embedder.litellm") as mock_llm:
            mock_response = MagicMock()
            mock_response.data = [
                {"embedding": [0.1, 0.2]},
                {"embedding": [0.3, 0.4]},
            ]
            mock_llm.aembedding = AsyncMock(return_value=mock_response)

            from ai_svc.rag.embedder import embed_batch
            result = await embed_batch(["text 1", "text 2"])
            assert len(result) == 2


class TestIEPRouteEdgeCases:
    @pytest.mark.asyncio
    async def test_parse_pdf_base64(self, client):
        import base64
        import io
        from pypdf import PdfWriter

        writer = PdfWriter()
        writer.add_blank_page(width=200, height=200)
        buf = io.BytesIO()
        writer.write(buf)
        pdf_b64 = base64.b64encode(buf.getvalue()).decode()

        with patch("ai_svc.routes.iep.get_gateway") as mock_gw, \
             patch("ai_svc.routes.iep.publish_event", new_callable=AsyncMock):
            with patch("ai_svc.routes.iep.IEPParser") as MockParser:
                from ai_svc.iep.extractor import IEPExtraction
                mock_parser = AsyncMock()
                mock_parser.parse_pdf = AsyncMock(return_value=IEPExtraction())
                MockParser.return_value = mock_parser

                resp = await client.post("/ai/iep/parse", json={
                    "learner_id": str(uuid.uuid4()),
                    "document_id": str(uuid.uuid4()),
                    "pdf_base64": pdf_b64,
                })
                assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_parse_url_pdf(self, client):
        with patch("ai_svc.routes.iep.get_gateway") as mock_gw, \
             patch("ai_svc.routes.iep.publish_event", new_callable=AsyncMock):
            with patch("ai_svc.routes.iep.IEPParser") as MockParser:
                from ai_svc.iep.extractor import IEPExtraction
                mock_parser = AsyncMock()
                mock_parser.parse_image = AsyncMock(return_value=IEPExtraction())
                MockParser.return_value = mock_parser

                resp = await client.post("/ai/iep/parse", json={
                    "learner_id": str(uuid.uuid4()),
                    "document_id": str(uuid.uuid4()),
                    "file_url": "https://example.com/iep.pdf",
                    "file_type": "pdf",
                })
                assert resp.status_code == 200


class TestGatewayVisionFailover:
    @pytest.mark.asyncio
    async def test_vision_failover(self):
        from ai_svc.llm.gateway import LLMGateway

        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Fallback vision"
        mock_response.choices[0].finish_reason = "stop"
        mock_response.usage = MagicMock(prompt_tokens=5, completion_tokens=3, total_tokens=8)

        call_count = 0
        async def side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise Exception("429 rate limit")
            return mock_response

        with patch("ai_svc.llm.gateway.litellm") as mock_litellm:
            mock_litellm.acompletion = AsyncMock(side_effect=side_effect)
            gw = LLMGateway()
            result = await gw.generate_with_vision(
                messages=[{"role": "user", "content": "test"}],
                image_url="https://example.com/img.jpg",
            )
            assert result.content == "Fallback vision"
            assert call_count == 2

    @pytest.mark.asyncio
    async def test_vision_all_fail(self):
        from ai_svc.llm.gateway import LLMGateway
        with patch("ai_svc.llm.gateway.litellm") as mock_litellm:
            mock_litellm.acompletion = AsyncMock(side_effect=Exception("500 error"))
            gw = LLMGateway()
            with pytest.raises(Exception):
                await gw.generate_with_vision(
                    messages=[{"role": "user", "content": "test"}],
                    image_url="https://example.com/img.jpg",
                )

    @pytest.mark.asyncio
    async def test_vision_non_failover_error(self):
        from ai_svc.llm.gateway import LLMGateway
        with patch("ai_svc.llm.gateway.litellm") as mock_litellm:
            mock_litellm.acompletion = AsyncMock(side_effect=Exception("401 unauthorized"))
            gw = LLMGateway()
            with pytest.raises(Exception, match="401"):
                await gw.generate_with_vision(
                    messages=[{"role": "user", "content": "test"}],
                    image_url="https://example.com/img.jpg",
                )
