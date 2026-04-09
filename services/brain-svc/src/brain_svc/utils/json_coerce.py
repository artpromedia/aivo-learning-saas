"""Safe JSON coercion for database fields that may be stored as strings."""

from __future__ import annotations

import json
from typing import Any


def ensure_dict(val: Any, default: Any = None) -> dict:
    if default is None:
        default = {}
    if val is None:
        return default
    if isinstance(val, str):
        try:
            parsed = json.loads(val)
            return parsed if isinstance(parsed, dict) else default
        except (json.JSONDecodeError, ValueError):
            return default
    if isinstance(val, dict):
        return val
    return default


def ensure_list(val: Any) -> list:
    if val is None:
        return []
    if isinstance(val, str):
        try:
            parsed = json.loads(val)
            return parsed if isinstance(parsed, list) else []
        except (json.JSONDecodeError, ValueError):
            return []
    return val if isinstance(val, list) else []
