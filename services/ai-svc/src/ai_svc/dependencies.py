"""FastAPI dependency injection utilities."""

from __future__ import annotations

from ai_svc.llm.gateway import LLMGateway
from ai_svc.llm.token_tracker import TokenTracker
from ai_svc.config import get_settings

_gateway: LLMGateway | None = None
_token_tracker: TokenTracker | None = None


def get_gateway() -> LLMGateway:
    global _gateway
    if _gateway is None:
        _gateway = LLMGateway()
    return _gateway


def get_token_tracker() -> TokenTracker:
    global _token_tracker
    if _token_tracker is None:
        _token_tracker = TokenTracker()
    return _token_tracker
