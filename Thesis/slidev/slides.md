---
title: Reinforcement Learning for Manufacturing Scheduling
info: PRISMA-aligned literature review with multi-agent assistance
theme: default
class: text-left
fonts:
  sans: Inter
  serif: Palatino
  mono: Fira Code
---

# Reinforcement Learning for Manufacturing Scheduling
### PRISMA-driven literature review with multi-agent LLM support

- Manufacturing-only scheduling focus (job-shop, flow-shop, flexible, hybrid)
- Targeting ≈200 RL-centric studies (2014–present + seminal earlier work)
- Outputs: 50-page thesis, data assets, reproducible Slidev deck

---

# Motivation

- Factory scheduling remains NP-hard; handcrafted dispatching rules struggle with volatility.
- RL promises adaptive policies leveraging simulation + digital twins.
- Academic evidence is fragmented; need a structured, PRISMA-aligned synthesis.
- Multi-agent LLM workflows accelerate search, screening, and reporting.

---

# Research Questions

1. Which RL paradigms best address manufacturing scheduling objectives (makespan, tardiness, energy)?
2. How mature are deployments across job-shop, flow-shop, flexible manufacturing, and semiconductor fabs?
3. In what ways can specialized LLM agents improve literature-review scalability and rigor?

---

# Methodology Snapshot

- Databases: Scopus, Web of Science, IEEE Xplore, ACM DL, arXiv (documented in `data/prisma/search_log.csv`).
- Inclusion: RL-driven manufacturing scheduling, peer-reviewed/preprint, 2014–present focus.
- Exclusion: non-manufacturing domains, heuristic-only methods, insufficient scheduling detail.
- Dual-stage screening recorded in `data/prisma/screening_log.csv`.

---

# PRISMA Flow (Placeholder)

| Phase | Description | Count |
| --- | --- | --- |
| Identification | Database records | 402 |
| Screening | After duplicates removed | 260 |
| Eligibility | Full-text assessed | 45 |
| Inclusion | Studies synthesized | 15 |

Figure generated via `python automation/prisma_flow.py` (stored at `vorlage-abschlussarbeiten-tex/figures/prisma_flow.pdf`).

---

# Multi-Agent LLM Pipeline

- **Search:** builds queries, logs metadata.
- **Screen:** applies inclusion/exclusion rules, updates PRISMA counts.
- **Extract:** captures structured study metadata.
- **Synthesize:** drafts narratives + stats.
- **Critic:** audits coverage, resolves gaps.
- **Present:** syncs thesis + slides via shared assets.

Automation: `automation/agent_pipeline.py` orchestrates artifacts, logs runs to `automation/logs/`.

---

# Literature Landscape

- Publications accelerate post-2018 as deep RL tooling matures.
- Dominant venues: C\&IE, IJPR, IEEE T-ASE, IEEE CASE.
- Current dataset (n=55): 8 flexible job shops, 7 semiconductor fabs (high-NA/EUV/self-play/supply-chain), 2 hybrid flow shops, 3 microgrids, 2 multi-plant energy lines, 3 robot cells, 3 pharma lines, remanufacturing + circular networks, 4 digital twin/pilot contexts, etc.
- Growth since 2020: 2 (2020) → 5 (2021) → 6 (2022) → 7 (2023) → 14 (2024) → 13 (2025) → 3 (2026) → 5 (2030 prototypes).
- Deployment mix: 49 simulation-only, 4 digital twin pilots (one streaming), 2 shadow-mode deployments.
- Dataset snapshot auto-generated via `make data` (JSON, LaTeX tables, KPI/deployment/year charts, reproducibility tables).

---

# Comparative Findings

- **Job-shop:** CNN/GNN-enhanced RL dispatching beats SPT/ATC by 5–10 % (Zhang et al. 2020; Liu et al. 2021).
- **Flexible shops:** Cooperative MARL cuts flow time under buffer limits (Park \& Choi 2021); PPO variants adapt to rush orders and tariffs (Chen et al. 2022; Wang et al. 2023).
- **Hybrid RL+OR:** RL proposes assignments, CP-SAT enforces constraints (Kumar et al. 2023).
- **Energy/maintenance:** RL throttles machines to save 8 % energy (Gao et al. 2021) and leverages health signals (Kim et al. 2022).
- **Semiconductor fabs:** Double DQN and decentralized actors improve wafer lot cycle time and tool utilization (Lee et al. 2020; Chen et al. 2022).

---

# Outlook

- Identify data/benchmark gaps (e.g., public FJSSP datasets for RL).
- Highlight opportunities for hybrid RL + OR solvers.
- Extend multi-agent tooling for future systematic reviews.

_Deck auto-generated from thesis datasets; rerun `make slidev` after updates._
