#!/usr/bin/env python3
"""
Generate a PRISMA-style summary chart from data/prisma/flow_counts.csv.

The script produces a simple bar visualization stored under
vorlage-abschlussarbeiten-tex/figures/prisma_flow.pdf for inclusion in the thesis.
"""
from __future__ import annotations

import csv
import sys
from pathlib import Path

import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent.parent
COUNTS_CSV = ROOT / "data" / "prisma" / "flow_counts.csv"
FIG_PATH = ROOT / "vorlage-abschlussarbeiten-tex" / "figures" / "prisma_flow.pdf"

PHASE_ORDER = [
    ("identification", "Identification"),
    ("screening", "Screening"),
    ("eligibility", "Eligibility"),
    ("inclusion", "Inclusion"),
]


def read_counts(csv_path: Path) -> dict[str, int]:
    counts: dict[str, int] = {}
    with csv_path.open("r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            phase = row["phase"].strip().lower()
            count = int(row["count"])
            counts[phase] = max(counts.get(phase, 0), count)
    return counts


def aggregate_for_bar(counts: dict[str, int]) -> tuple[list[str], list[int]]:
    labels = []
    values = []
    for slug, label in PHASE_ORDER:
        labels.append(label)
        values.append(counts.get(slug, 0))
    return labels, values


def make_plot(labels: list[str], values: list[int], output: Path) -> None:
    plt.style.use("seaborn-v0_8-whitegrid")
    fig, ax = plt.subplots(figsize=(6, 3))
    bars = ax.bar(labels, values, color="#1f77b4")
    ax.set_ylabel("Record count")
    ax.set_title("PRISMA Summary (auto-generated)")
    for bar, value in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 2, str(value), ha="center", va="bottom", fontsize=9)
    fig.tight_layout()
    output.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output)
    plt.close(fig)


def main() -> int:
    if not COUNTS_CSV.exists():
        print(f"Counts file missing: {COUNTS_CSV}", file=sys.stderr)
        return 1
    counts = read_counts(COUNTS_CSV)
    labels, values = aggregate_for_bar(counts)
    make_plot(labels, values, FIG_PATH)
    print(f"Saved PRISMA chart to {FIG_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
