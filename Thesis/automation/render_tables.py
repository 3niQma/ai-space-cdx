#!/usr/bin/env python3
"""
Render LaTeX tables from data/processed/study_summary.json.

Outputs:
  - tables/domain_distribution.tex
  - tables/rl_method_distribution.tex
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SUMMARY_PATH = ROOT / "data" / "processed" / "study_summary.json"
TABLES_DIR = ROOT / "vorlage-abschlussarbeiten-tex" / "tables"


def load_summary(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    return data


def tex_table(filename: str, headers: list[str], rows: list[list[str]]) -> None:
    TABLES_DIR.mkdir(parents=True, exist_ok=True)
    lines = ["\\begin{tabular}{l r r}", "\\toprule"]
    lines.append(f"{headers[0]} & {headers[1]} & {headers[2]} \\\\")
    lines.append("\\midrule")
    lines.extend([f"{row[0]} & {row[1]} & {row[2]} \\\\" for row in rows])
    lines.append("\\bottomrule")
    lines.append("\\end{tabular}")
    (TABLES_DIR / filename).write_text("\n".join(lines), encoding="utf-8")


def format_rows(entries: list[dict], total: int) -> list[list[str]]:
    rows: list[list[str]] = []
    for entry in entries:
        pct = (entry["count"] / total * 100) if total else 0
        rows.append([entry["label"], str(entry["count"]), f"{pct:0.0f}\\%"])
    rows.append(["Total", str(total), "100\\%" if total else "0\\%"])
    return rows


def main() -> int:
    if not SUMMARY_PATH.exists():
        raise FileNotFoundError(f"Missing summary: {SUMMARY_PATH}")
    summary = load_summary(SUMMARY_PATH)
    total = summary.get("total_studies", 0)

    domain_rows = format_rows(summary.get("by_domain", []), total)
    tex_table(
        "domain_distribution.tex",
        ["Manufacturing domain", "Count", "Share"],
        domain_rows,
    )

    method_rows = format_rows(summary.get("by_method", []), total)
    tex_table(
        "rl_method_distribution.tex",
        ["RL method", "Count", "Share"],
        method_rows,
    )
    repro = summary.get("reproducibility", {})
    for field, entries in repro.items():
        tex_table(
            f"{field}_distribution.tex",
            [field.replace("_", " ").title(), "Count", "Share"],
            format_rows(entries, total),
        )

    print(f"Wrote tables to {TABLES_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
