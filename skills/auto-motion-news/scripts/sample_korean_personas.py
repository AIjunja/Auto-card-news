#!/usr/bin/env python3
"""Sample real rows from NVIDIA Nemotron-Personas-Korea for video QA."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import random
import sys
from pathlib import Path
from typing import Any


DATASET_ID = "nvidia/Nemotron-Personas-Korea"
LICENSE_NOTE = "CC BY 4.0"
DEFAULT_CACHE_DIR = ".cache/nemotron-personas-korea"
DEFAULT_FIELDS = [
    "uuid",
    "persona",
    "professional_persona",
    "cultural_background",
    "skills_and_expertise",
    "hobbies_and_interests",
    "career_goals_and_ambitions",
    "sex",
    "age",
    "marital_status",
    "family_type",
    "housing_type",
    "education_level",
    "occupation",
    "district",
    "province",
    "country",
]


def compact_value(value: Any) -> Any:
    if isinstance(value, str):
        return " ".join(value.split())
    if isinstance(value, list):
        return [compact_value(item) for item in value]
    return value


def trim_row(row: dict[str, Any]) -> dict[str, Any]:
    return {field: compact_value(row.get(field)) for field in DEFAULT_FIELDS if field in row}


def cache_path(cache_dir: Path) -> Path:
    return cache_dir / "personas.jsonl"


def load_cache(cache_dir: Path) -> list[dict[str, Any]]:
    path = cache_path(cache_dir)
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def append_cache(cache_dir: Path, rows: list[dict[str, Any]]) -> None:
    cache_dir.mkdir(parents=True, exist_ok=True)
    existing_ids = {row.get("uuid") for row in load_cache(cache_dir)}
    with cache_path(cache_dir).open("a", encoding="utf-8") as handle:
        for row in rows:
            if row.get("uuid") in existing_ids:
                continue
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def fetch_rows(count: int, seed: int, cache_dir: Path, buffer_size: int) -> list[dict[str, Any]]:
    try:
        from datasets import load_dataset
    except ImportError as exc:
        raise RuntimeError(
            "The 'datasets' package is required to fetch real Nemotron samples. "
            "Install it with: python -m pip install datasets"
        ) from exc

    dataset = load_dataset(DATASET_ID, split="train", streaming=True)
    dataset = dataset.shuffle(seed=seed, buffer_size=buffer_size)
    rows = [trim_row(row) for row in dataset.take(count)]
    append_cache(cache_dir, rows)
    return rows


def select_from_cache(count: int, seed: int, cache_dir: Path) -> list[dict[str, Any]]:
    cached = load_cache(cache_dir)
    if not cached:
        return []
    rng = random.Random(seed)
    if len(cached) <= count:
        return cached
    return rng.sample(cached, count)


def persona_label(row: dict[str, Any]) -> str:
    parts = [
        str(row.get("province") or "").strip(),
        str(row.get("district") or "").strip(),
        f"{row.get('age')}세" if row.get("age") is not None else "",
        str(row.get("sex") or "").strip(),
        str(row.get("occupation") or "").strip(),
    ]
    return " / ".join(part for part in parts if part)


def as_markdown(rows: list[dict[str, Any]], topic: str | None) -> str:
    today = dt.date.today().isoformat()
    lines = [
        "# Korean Persona Video QA Panel",
        "",
        f"- Source dataset: `{DATASET_ID}`",
        f"- License: `{LICENSE_NOTE}`",
        f"- Sampled on: `{today}`",
    ]
    if topic:
        lines.append(f"- Topic: {topic}")
    lines.extend(
        [
            "",
            "Use these real synthetic Korean personas as a viewer panel. Do not quote private-looking details as if they are real people; use them to test whether the script, scene, and caption sound natural, concrete, and worth watching.",
            "",
        ]
    )

    for index, row in enumerate(rows, start=1):
        lines.extend(
            [
                f"## Persona {index}: {persona_label(row)}",
                "",
                f"- Summary: {row.get('persona') or ''}",
                f"- Cultural background: {row.get('cultural_background') or ''}",
                f"- Skills / expertise: {row.get('skills_and_expertise') or ''}",
                f"- Hobbies / interests: {row.get('hobbies_and_interests') or ''}",
                f"- Goals: {row.get('career_goals_and_ambitions') or ''}",
                "",
                "Video QA prompts:",
                "- Would this person understand the first 2 seconds?",
                "- Which spoken line feels translated, corporate, or too technical?",
                "- Which scene needs a more familiar Korean example?",
                "- Would they keep watching, save, share, comment, or leave?",
                "",
            ]
        )
    return "\n".join(lines)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sample real Nemotron-Personas-Korea rows for Korean video QA.")
    parser.add_argument("--count", type=int, default=7, help="Number of personas to sample.")
    parser.add_argument("--seed", type=int, default=20260504, help="Deterministic shuffle seed.")
    parser.add_argument("--topic", default="", help="Optional video topic to include in the panel notes.")
    parser.add_argument("--cache-dir", default=DEFAULT_CACHE_DIR, help="Cache directory for sampled rows.")
    parser.add_argument("--buffer-size", type=int, default=2000, help="Streaming shuffle buffer size.")
    parser.add_argument("--offline", action="store_true", help="Use cached rows only.")
    parser.add_argument("--format", choices=["markdown", "jsonl"], default="markdown", help="Output format.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.count < 1:
        raise SystemExit("--count must be at least 1")

    cache_dir = Path(args.cache_dir)
    rows: list[dict[str, Any]]

    if args.offline:
        rows = select_from_cache(args.count, args.seed, cache_dir)
        if not rows:
            print("No cached Nemotron personas found. Run without --offline first.", file=sys.stderr)
            return 2
    else:
        try:
            rows = fetch_rows(args.count, args.seed, cache_dir, args.buffer_size)
        except Exception as exc:
            print(f"Fetch failed: {exc}", file=sys.stderr)
            rows = select_from_cache(args.count, args.seed, cache_dir)
            if not rows:
                return 2
            print("Using cached Nemotron personas instead.", file=sys.stderr)

    if args.format == "jsonl":
        for row in rows:
            print(json.dumps(row, ensure_ascii=False))
    else:
        print(as_markdown(rows, args.topic or None))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
