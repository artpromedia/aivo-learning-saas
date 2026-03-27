"""Prompt injection prevention — sanitize user input before LLM calls."""

from __future__ import annotations

import re
import logging
from typing import Any

logger = logging.getLogger(__name__)

# Patterns that indicate prompt injection attempts
_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"ignore\s+(all\s+)?above\s+instructions",
    r"disregard\s+(all\s+)?(previous|prior|above)",
    r"forget\s+(all\s+)?(previous|prior|above)",
    r"you\s+are\s+now\s+(a|an)\s+\w+",
    r"new\s+system\s+prompt",
    r"override\s+system\s+(prompt|instructions)",
    r"</?(system|assistant|user)>",
    r"\[INST\]|\[/INST\]",
    r"<\|im_start\|>|<\|im_end\|>",
]

_COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in _INJECTION_PATTERNS]


def detect_injection(text: str) -> bool:
    """Check if text contains prompt injection patterns."""
    for pattern in _COMPILED_PATTERNS:
        if pattern.search(text):
            return True
    return False


def sanitize_text(text: str) -> str:
    """Sanitize user-provided text by escaping potentially dangerous patterns."""
    # Remove control characters except newlines and tabs
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    # Strip XML-like role tags that could confuse the model
    cleaned = re.sub(r"</?(?:system|assistant|user|human|ai)>", "", cleaned, flags=re.IGNORECASE)
    # Strip special tokens
    cleaned = re.sub(r"<\|[^|]+\|>", "", cleaned)
    cleaned = re.sub(r"\[/?INST\]", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


def sanitize_messages(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Sanitize all user messages in a messages array.

    System messages are left untouched. User messages are sanitized.
    """
    sanitized = []
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")

        if role == "user" and isinstance(content, str):
            cleaned = sanitize_text(content)
            if detect_injection(cleaned):
                logger.warning("Prompt injection detected and neutralized")
                cleaned = f"[User input]: {cleaned}"
            sanitized.append({"role": role, "content": cleaned})
        else:
            sanitized.append(msg)
    return sanitized
