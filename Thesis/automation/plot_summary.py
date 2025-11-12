#!/usr/bin/env python3
"""
Create bar charts from data/processed/study_summary.json.

Outputs PNG/PDF charts under vorlage-abschlussarbeiten-tex/figures/.
"""
from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent.parent
SUMMARY_PATH = ROOT / "data" / "processed" / "study_summary.json"
FIG_DIR = ROOT / "vorlage-abschlussarbeiten-tex" / "figures"


def load_summary() -> dict:
    return json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))


def plot_bar(entries: list[dict], title: str, xlabel: str, filename: str) -> None:
    labels = [entry["label"] for entry in entries]
    counts = [entry["count"] for entry in entries]

    plt.style.use("seaborn-v0_8-whitegrid")
    fig, ax = plt.subplots(figsize=(6, 3))
    bars = ax.bar(labels, counts, color="#1f77b4")
    ax.set_ylabel("Count")
    ax.set_xlabel(xlabel)
    ax.set_title(title)
    ax.tick_params(axis="x", rotation=30)
    for bar, value in zip(bars, counts):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.2,
            str(value),
            ha="center",
            va="bottom",
            fontsize=8,
        )
    fig.tight_layout()
    FIG_DIR.mkdir(parents=True, exist_ok=True)
    fig.savefig(FIG_DIR / filename, dpi=300)
    plt.close(fig)


def plot_line(entries: list[dict], title: str, xlabel: str, filename: str) -> None:
    if not entries:
        return
    labels = [entry["label"] for entry in entries]
    counts = [entry["count"] for entry in entries]
    x_values = list(range(len(labels)))
    plt.style.use("seaborn-v0_8-whitegrid")
    fig, ax = plt.subplots(figsize=(6, 3))
    ax.plot(x_values, counts, marker="o", color="#d62728", linewidth=2)
    ax.fill_between(x_values, counts, color="#d62728", alpha=0.1)
    ax.set_ylabel("Number of studies")
    ax.set_xlabel(xlabel)
    ax.set_title(title)
    ax.set_xticks(x_values)
    ax.set_xticklabels(labels, rotation=30)
    ax.grid(True, which="major", axis="both", linestyle="--", linewidth=0.5, alpha=0.6)
    for x_val, value in zip(x_values, counts):
        ax.text(x_val, value + 0.2, str(value), ha="center", va="bottom", fontsize=8)
    fig.tight_layout()
    FIG_DIR.mkdir(parents=True, exist_ok=True)
    fig.savefig(FIG_DIR / filename, dpi=300)
    plt.close(fig)


def main() -> int:
    if not SUMMARY_PATH.exists():
        raise FileNotFoundError(f"Missing summary: {SUMMARY_PATH}")
    summary = load_summary()
    plot_bar(
        summary.get("by_year", []),
        "Included studies by publication year",
        "Year",
        "year_counts.png",
    )
    plot_bar(
        summary.get("by_domain", []),
        "Included studies by manufacturing domain",
        "Domain",
        "domain_counts.png",
    )
    plot_bar(
        summary.get("by_method", []),
        "Included studies by RL method",
        "RL method",
        "method_counts.png",
    )
    plot_bar(
        summary.get("by_kpi", [])[:6],
        "Top-reported KPIs",
        "KPI",
        "kpi_counts.png",
    )
    plot_bar(
        summary.get("reproducibility", {}).get("deployment_status", []),
        "Deployment status distribution",
        "Status",
        "deployment_counts.png",
    )
    plot_line(
        summary.get("by_year", []),
        "Cumulative inclusion trend",
        "Year",
        "year_trend.png",
    )
    print(f"Saved charts to {FIG_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
