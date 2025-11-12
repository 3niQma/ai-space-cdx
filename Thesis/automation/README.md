# Automation

This directory collects reusable scripts (Python or shell) to orchestrate the literature-review agents, regenerate PRISMA artifacts, and sync the Slidev deck with thesis outputs.

Planned components:
- `agent_pipeline.py`: sequentially triggers agent tasks and logs artifacts.
- `export_figures.py`: converts processed data into figures for both thesis and slides.
- `update_slides.py`: injects latest highlights into `slidev/slides.md`.
- `prisma_flow.py`: reads `data/prisma/flow_counts.csv` and regenerates the PRISMA summary chart (`figures/prisma_flow.pdf`).
- `summarize_studies.py`: aggregates `data/processed/study_catalog.csv` into `study_summary.json` (counts per year/domain/method/KPI) for quick reporting.
- `render_tables.py`: reads `study_summary.json` and regenerates `tables/domain_distribution.tex` plus `tables/rl_method_distribution.tex`.
- `plot_summary.py`: produces bar charts (`figures/domain_counts.png`, `figures/method_counts.png`) visualizing current coverage.

Scripts should accept configuration files from `config/` (to be created) and emit status reports to `automation/logs/`.
