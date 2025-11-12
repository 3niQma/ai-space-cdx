#!/usr/bin/env python3
"""
Summarize the processed study catalog for quick inclusion in the thesis/Slidev deck.

Outputs a JSON file with counts per year, manufacturing domain, RL method, and KPI.
"""
from __future__ import annotations

import csv
import json
from collections import Counter, OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "data" / "processed" / "study_catalog.csv"
SUMMARY = ROOT / "data" / "processed" / "study_summary.json"
REPRO_FIELDS = ["code_available", "simulator_available", "deployment_status"]


def read_catalog(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        return [row for row in reader]


def normalize_list(value: str) -> list[str]:
    if not value:
        return []
    parts = [item.strip() for item in value.split(",")]
    return [item for item in parts if item]


def summarize(rows: list[dict[str, str]]) -> dict:
    by_year = Counter()
    by_domain = Counter()
    by_method = Counter()
    by_kpi = Counter()
    reproducibility = {field: Counter() for field in REPRO_FIELDS}

    for row in rows:
        by_year[row["year"]] += 1
        by_domain[row["manufacturing_domain"]] += 1
        by_method[row["rl_method"]] += 1
        for kpi in normalize_list(row["kpis"].replace("and", ",")):
            by_kpi[kpi.strip()] += 1
        for field in REPRO_FIELDS:
            key = row.get(field, "Unknown") or "Unknown"
            reproducibility[field][key] += 1

    def sorted_counter(counter: Counter) -> list[dict[str, int]]:
        return [
            {"label": key, "count": counter[key]}
            for key in sorted(counter.keys())
        ]

    summary = OrderedDict(
        total_studies=len(rows),
        by_year=sorted_counter(by_year),
        by_domain=sorted_counter(by_domain),
        by_method=sorted_counter(by_method),
        by_kpi=sorted_counter(by_kpi),
        reproducibility={
            field: sorted_counter(counter) for field, counter in reproducibility.items()
        },
    )
    return summary


def main() -> int:
    rows = read_catalog(CATALOG)
    summary = summarize(rows)
    SUMMARY.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
