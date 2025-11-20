# RL + Scheduling Thesis – Next Steps Checklist

## Status Summary
- LaTeX scaffold set up in `thesis/` with IEEE style; placeholder sections and three populated tables.
- Literature matrix at `thesis/literature_matrix.csv` with 32 entries (including three verified PDFs and four metadata-only 2024 leads).
- BibTeX at `thesis/references.bib` with 41 entries; no in-text citations yet (bibliography empty in PDF).
- Downloaded open-access PDFs in `PapersAdditional/`:
  - `Learning_to_Dispatch_for_Job_Shop_Scheduling_via_Deep_Reinforcement_Learning_2020.pdf`
  - `Learning_to_schedule_job_shop_problems_representation_and_policy_learning_using_2021.pdf`
  - `Flexible_Job_Shop_Scheduling_via_Dual_Attention_Network_Based_Reinforcement_Lear_2023.pdf`
  - (plus two tiny/irrelevant PDFs: `mao2016_deeprm.pdf`, `songwen2022_tii_fjsp.pdf`, `tassel2020_arxiv.pdf`)
- Built PDF: `thesis/thesis.pdf` (empty bib, overfull hbox warnings only).

## Concrete Next Steps
1) **Citations and Bibliography**
   - Insert citations in `chapters.tex` for the verified entries:
     - Zhang et al. 2020 dispatch (`zhang2020_dispatch`)
     - Park et al. 2021 GNN+PPO (`park2021_graphjss`)
     - Wang et al. 2023 dual-attention (`wang2023_dualattn`)
     - Surveys: `wang2021_csms`, `panzer2022_ijpr`, `waubert2022_jim`.
   - Rebuild to populate the bibliography.

2) **Matrix/Bib Expansion**
   - Use OpenAlex or known DOIs/arXiv IDs to add more RL+scheduling papers (semiconductor, energy-aware, cloud/edge, safe/offline/meta RL) to `thesis/literature_matrix.csv` and `thesis/references.bib`.
   - Replace metadata-only rows `sem2024_*` with real entries when PDFs/DOIs are available or drop them if unverifiable.

3) **Tables/Analysis**
   - Populate additional tables for:
     - Performance vs baselines per domain (makespan/tardiness/energy/latency).
     - Generalization/robustness (train/test splits, OOD, dynamic arrivals).
   - Add a PRISMA flow diagram placeholder/data once screening counts are set.

4) **Drafting Sections**
   - Methodology: finalize search strings per database and PRISMA counts; remove draft placeholder.
   - Taxonomy/Analysis: weave in summarized findings from matrix (state/action/reward patterns, constraint handling, baselines, generalization).
   - Background: add brief scheduling/RL fundamentals and metrics table.

5) **Cleanup Decisions Before Commit**
   - Decide whether to track `PapersAdditional/*.pdf` and `thesis/thesis.pdf`; otherwise add to `.gitignore`.
   - Remove auxiliary LaTeX files (`*.aux`, `*.log`, `*.fdb_latexmk`, etc.) before commit.

## Git Reminder
- `Thesis2/` is currently untracked. Run `git add Thesis2` (after ignoring any artifacts you don’t want) and commit from repo root.
