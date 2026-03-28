"""CLI script to ingest curriculum JSON files into pgvector.

Usage:
    python -m ai_svc.rag.ingest
    python -m ai_svc.rag.ingest --data-dir /path/to/json/files
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Any

import tiktoken

from ai_svc.rag.embedder import embed_batch
from ai_svc.rag.knowledge_base import KnowledgeBase
from ai_svc.db import get_session

logger = logging.getLogger(__name__)

# Default data directory relative to ai-svc root
_DEFAULT_DATA_DIR = Path(__file__).resolve().parents[3] / "curriculum-data"

# Chunking constants
MAX_TOKENS = 500
OVERLAP_TOKENS = 50


def chunk_text(text: str, max_tokens: int = MAX_TOKENS, overlap_tokens: int = OVERLAP_TOKENS) -> list[str]:
    """Split text into chunks of at most *max_tokens* tokens with *overlap_tokens* overlap.

    Uses tiktoken cl100k_base encoding for accurate token counting.
    Returns a list of text chunks.
    """
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)

    if len(tokens) <= max_tokens:
        return [text]

    chunks: list[str] = []
    start = 0
    while start < len(tokens):
        end = min(start + max_tokens, len(tokens))
        chunk_tokens = tokens[start:end]
        chunks.append(enc.decode(chunk_tokens))
        if end >= len(tokens):
            break
        start = end - overlap_tokens

    return chunks


def _load_json_files(data_dir: Path) -> list[dict[str, Any]]:
    """Load all JSON files from data directory and return flat list of records."""
    all_records: list[dict[str, Any]] = []
    json_files = sorted(data_dir.glob("*.json"))
    if not json_files:
        logger.warning("No JSON files found in %s", data_dir)
        return all_records

    for json_file in json_files:
        logger.info("Loading %s", json_file.name)
        with open(json_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            all_records.extend(data)
        elif isinstance(data, dict) and "standards" in data:
            all_records.extend(data["standards"])
        else:
            logger.warning("Skipping %s — unexpected format", json_file.name)

    logger.info("Loaded %d records from %d files", len(all_records), len(json_files))
    return all_records


def _record_to_text(record: dict[str, Any]) -> str:
    """Convert a curriculum standard record to a text string for embedding."""
    parts: list[str] = []
    if record.get("standard_code"):
        parts.append(f"[{record['standard_code']}]")
    if record.get("grade"):
        parts.append(f"Grade {record['grade']}:")
    if record.get("domain"):
        parts.append(f"{record['domain']} -")
    if record.get("cluster"):
        parts.append(f"{record['cluster']}:")
    if record.get("description"):
        parts.append(record["description"])
    return " ".join(parts)


def _record_to_metadata(record: dict[str, Any]) -> dict[str, Any]:
    """Extract metadata fields from a curriculum standard record."""
    meta: dict[str, Any] = {}
    for key in ("id", "standard_code", "grade", "domain", "cluster", "subject", "grade_band"):
        if record.get(key) is not None:
            meta[key] = record[key]

    # Derive subject and grade_band if not present
    if "subject" not in meta:
        code = record.get("standard_code", record.get("id", ""))
        if "MATH" in code.upper():
            meta["subject"] = "MATH"
        elif "ELA" in code.upper() or "RL" in code or "RI" in code or "RF" in code or "W." in code or "L." in code:
            meta["subject"] = "ELA"

    if "grade_band" not in meta and "grade" in meta:
        g = meta["grade"]
        if isinstance(g, str):
            g = g.replace("K", "0")
            try:
                g = int(g)
            except ValueError:
                g = 0
        if g <= 2:
            meta["grade_band"] = "K-2"
        elif g <= 5:
            meta["grade_band"] = "3-5"
        elif g <= 8:
            meta["grade_band"] = "6-8"
        else:
            meta["grade_band"] = "9-12"

    return meta


async def ingest(data_dir: Path | None = None, batch_size: int = 50) -> int:
    """Ingest curriculum JSON files into pgvector.

    Returns the total number of embeddings stored.
    """
    data_dir = data_dir or _DEFAULT_DATA_DIR
    records = _load_json_files(data_dir)
    if not records:
        logger.warning("No records to ingest.")
        return 0

    kb = KnowledgeBase()
    total_stored = 0

    # Build all chunks with metadata
    all_items: list[dict[str, Any]] = []
    for record in records:
        text = _record_to_text(record)
        metadata = _record_to_metadata(record)
        chunks = chunk_text(text)
        for chunk in chunks:
            all_items.append({"text": chunk, "metadata": metadata})

    logger.info("Generated %d chunks from %d records", len(all_items), len(records))

    # Embed and store in batches
    for i in range(0, len(all_items), batch_size):
        batch = all_items[i : i + batch_size]
        texts = [item["text"] for item in batch]

        logger.info(
            "Embedding batch %d/%d (%d items)",
            i // batch_size + 1,
            (len(all_items) + batch_size - 1) // batch_size,
            len(batch),
        )
        embeddings = await embed_batch(texts)

        store_items = [
            {
                "content": item["text"],
                "embedding": emb,
                "metadata": item["metadata"],
            }
            for item, emb in zip(batch, embeddings)
        ]

        async with get_session() as session:
            count = await kb.batch_store_embeddings(session, store_items)
            total_stored += count

        logger.info("Stored %d embeddings (total: %d)", count, total_stored)

    logger.info("Ingestion complete: %d total embeddings stored", total_stored)
    return total_stored


def main() -> None:
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Ingest curriculum JSON data into pgvector embeddings."
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=_DEFAULT_DATA_DIR,
        help="Directory containing curriculum JSON files",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=50,
        help="Number of texts to embed per API call",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )

    total = asyncio.run(ingest(data_dir=args.data_dir, batch_size=args.batch_size))
    print(f"Done. Stored {total} embeddings.")


if __name__ == "__main__":
    main()
