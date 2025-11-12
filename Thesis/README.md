# Reinforcement Learning for Manufacturing Scheduling – Thesis Project

This repository hosts a 50-page thesis (LaTeX) and a Slidev presentation focused on a PRISMA-aligned literature review of reinforcement learning (RL) techniques for manufacturing scheduling, supported by a multi-agent LLM workflow.

## Directory Overview

- `vorlage-abschlussarbeiten-tex/` – KOMA-Script thesis template with customized chapters, appendices, figures, and tables.
- `slidev/` – Slidev deck mirroring the thesis narrative (`slides.md`, `package.json`).
- `data/` – PRISMA logs (`prisma/`), raw/processed datasets, and synthesized notes.
- `automation/` – Python utilities for orchestrating agents, generating PRISMA charts, and summarizing study metadata.
- `agents/` – Documentation for specialized LLM agents (search, screening, extraction, synthesis, critic, presentation).

## Build & Automation

1. **Thesis PDF**
   ```bash
   make thesis          # requires latexmk + TeX Live
   ```
2. **Slidev Deck**
   ```bash
   make slidev          # runs npm install and slidev build
   ```
3. **Agent Pipeline placeholders**
   ```bash
   python automation/agent_pipeline.py
   ```
4. **PRISMA, tables, charts**
   ```bash
   make data   # runs summarizer, table renderer, year/KPI/deployment charts, PRISMA chart
   ```
   (Individual scripts: `automation/summarize_studies.py`, `automation/render_tables.py`, `automation/plot_summary.py`, `automation/prisma_flow.py`.)

The Makefile currently triggers LaTeX and Slidev builds; extend it as needed to call the automation scripts.

## Updating the Literature Dataset

1. Append new searches to `data/prisma/search_log.csv`, then record screening decisions in `data/prisma/screening_log.csv`.
2. Insert accepted studies into `data/processed/study_catalog.csv` following the schema listed in Appendix~\ref{app:templates}. Capture exclusion reasons for every rejected full-text row in `screening_log.csv`.
3. Run the summarizer and PRISMA scripts (commands above) so figures/tables stay in sync; `make data` updates summary JSON, LaTeX tables, year/KPI/deployment charts, and PRISMA figure.
4. Regenerate thesis + Slidev outputs (`make thesis`, `make slidev`) to propagate changes.

## Multi-Agent Workflow

The automation blueprint uses six specialized agents (search, screen, extract, synthesize, critic, present). Their configurations live under `agents/` and `automation/config/agents.json`. The `automation/agent_pipeline.py` script emulates the pipeline offline; it can later be wired to actual LLM calls.

- PRISMA counts: 810 identified → 540 screened → 120 eligible → 50 included (55 catalog entries prepared).
- Study catalog: 55 entries covering flexible/job-shop, semiconductor fabs (EUV, high-NA, self-play, transfer, supply-chain, energy-aware), microgrid/multi-plant lines, aerospace cells, batch/biopharma, robot cells, remanufacturing/circular networks, and streaming digital twins; metadata includes testing, deployment status, and reproducibility flags.
- Slidev presentation includes current stats and references `data/processed/study_summary.json` plus the auto-generated charts (`figures/year_counts.png`, `deployment_counts.png`, etc.).

Keep iterating by expanding the dataset toward ~200 studies, enriching chapters with quantitative visuals, and tightening automation loops for reproducible reporting.
