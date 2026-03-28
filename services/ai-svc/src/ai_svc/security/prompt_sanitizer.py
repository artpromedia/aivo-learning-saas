"""Prompt injection prevention for LLM inputs and outputs.

Applied before ALL LLM calls to detect and neutralize prompt injection
attempts. Also validates LLM outputs for leaked system prompts and PII.
"""

from __future__ import annotations

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?previous\s+instructions", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+a", re.IGNORECASE),
    re.compile(r"system:\s*", re.IGNORECASE),
    re.compile(r"<\|im_start\|>", re.IGNORECASE),
    re.compile(r"ASSISTANT:", re.IGNORECASE),
    re.compile(r"\[INST\]", re.IGNORECASE),
    re.compile(r"```system", re.IGNORECASE),
    re.compile(r"ignore\s+the\s+above", re.IGNORECASE),
    re.compile(r"forget\s+(all\s+)?previous", re.IGNORECASE),
    re.compile(r"new\s+instruction", re.IGNORECASE),
    re.compile(r"disregard\s+(all\s+)?prior", re.IGNORECASE),
    re.compile(r"override\s+system", re.IGNORECASE),
    re.compile(r"<\|endoftext\|>", re.IGNORECASE),
    re.compile(r"<\|/SYSTEM\|>", re.IGNORECASE),
]

PROHIBITED_OUTPUT_PATTERNS = [
    re.compile(r"<\|SYSTEM\|>", re.IGNORECASE),
    re.compile(r"system\s+prompt", re.IGNORECASE),
    re.compile(r"my\s+instructions\s+are", re.IGNORECASE),
    re.compile(r"I\s+was\s+instructed\s+to", re.IGNORECASE),
]

# Control characters to strip (except newlines and tabs)
CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")

# Max input lengths by type
MAX_LENGTHS: dict[str, int] = {
    "chat_message": 4096,
    "homework_text": 8192,
    "iep_document": 16384,
    "search_query": 512,
    "default": 4096,
}


class SanitizationResult:
    """Result of input sanitization."""

    def __init__(self, text: str, flagged: bool, flags: list[str]) -> None:
        self.text = text
        self.flagged = flagged
        self.flags = flags


class PromptSanitizer:
    """Sanitizes user input before LLM processing."""

    def sanitize(
        self,
        user_input: str,
        input_type: str = "default",
    ) -> SanitizationResult:
        flags: list[str] = []

        # Strip control characters
        cleaned = CONTROL_CHAR_RE.sub("", user_input)

        # Truncate to max length
        max_len = MAX_LENGTHS.get(input_type, MAX_LENGTHS["default"])
        if len(cleaned) > max_len:
            cleaned = cleaned[:max_len]
            flags.append(f"truncated_to_{max_len}")

        # Detect injection patterns
        for pattern in INJECTION_PATTERNS:
            match = pattern.search(cleaned)
            if match:
                flags.append(f"injection_detected:{pattern.pattern[:40]}")
                # Neutralize by wrapping in quotes to make it literal text
                cleaned = cleaned.replace(
                    match.group(0),
                    f'"{match.group(0)}"',
                )

        flagged = len(flags) > 0
        if flagged:
            logger.warning(
                "Input flagged during sanitization: flags=%s input_preview=%s",
                flags,
                user_input[:100],
            )

        return SanitizationResult(text=cleaned, flagged=flagged, flags=flags)

    def wrap_user_input(self, sanitized_input: str) -> str:
        """Wrap user input in clear delimiters for LLM context."""
        return f"<|USER_INPUT|>{sanitized_input}<|/USER_INPUT|>"

    def validate_output(self, output: str) -> tuple[bool, list[str]]:
        """Validate LLM output for leaked system prompts or prohibited content."""
        issues: list[str] = []

        for pattern in PROHIBITED_OUTPUT_PATTERNS:
            if pattern.search(output):
                issues.append(f"leaked_content:{pattern.pattern[:40]}")

        # Check for email addresses that shouldn't be in output
        email_pattern = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
        emails_found = email_pattern.findall(output)
        if len(emails_found) > 2:
            issues.append(f"excessive_pii:emails={len(emails_found)}")

        is_valid = len(issues) == 0
        if not is_valid:
            logger.warning("LLM output failed validation: issues=%s", issues)

        return is_valid, issues
