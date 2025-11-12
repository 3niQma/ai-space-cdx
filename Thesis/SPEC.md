# Literature Review Project Spec

## 1. Objectives
- Produce a ~50-page LaTeX thesis (based on `vorlage-abschlussarbeiten-tex`, customized as needed) on *reinforcement learning for manufacturing scheduling*.
- Conduct a PRISMA-compliant literature review targeting ~200 high-quality papers, prioritizing work from the last 10 years while keeping seminal earlier contributions.
- Highlight settings with multiple specialized LLM agents assisting the research pipeline (search, screening, extraction, synthesis, presentation).
- Generate an automated Slidev presentation that mirrors the thesis narrative.

## 2. Deliverables
1. **Thesis manuscript**: Compilable via `thesis.tex`, with English-language content, customized structure, and BibTeX references stored in `thesis.bib`.
2. **Support files**: PRISMA documentation (flow diagram data, screening log in CSV/TSV, search strings).
3. **Slidev deck**: Source (`slides.md`) plus Slidev config in a `slidev` folder; automated build command documented.
4. **Automation scripts** (as needed) to orchestrate LLM agents and regenerate assets.

## 3. Scope & Constraints
- Focus exclusively on manufacturing scheduling domains (job-shop, flow-shop, flexible manufacturing, semiconductor fabs, etc.).
- Compare/contrast reinforcement learning paradigms (model-free vs. model-based, deep RL, multi-agent RL, hierarchical RL) and scheduling objectives (makespan, tardiness, energy, robustness).
- Include discussion on integrating RL with operations research heuristics and digital twins.
- Document opportunities and limitations of multi-agent LLM support (strengths, risks, reproducibility).
- Assume no internet access during implementation: rely on locally stored/added sources; document any gaps for later manual inclusion.

## 4. Multi-Agent Workflow Blueprint
1. **Search Agent**: Generates database queries, keywords, and inclusion/exclusion logic per PRISMA.
2. **Screening Agent**: Parses titles/abstracts, labels relevance, and logs decisions (to feed PRISMA counts).
3. **Extraction Agent**: Pulls structured metadata (year, domain, RL method, scheduling objective, dataset, KPIs) into a master table (CSV/JSON + LaTeX tables).
4. **Synthesis Agent**: Writes narrative sections, comparative analyses, and summary tables.
5. **Critic Agent**: Reviews drafts for coherence, coverage, and alignment with PRISMA decisions.
6. **Presentation Agent**: Translates thesis highlights into Slidev sections, ensuring figures/tables sync with thesis artifacts.

Automation plan: provide CLI scripts/notebooks (Python) that simulate agents sequentially; integrate prompts/configs so humans can substitute actual LLM calls later if network remains restricted.

## 5. PRISMA-Aligned Methodology
- **Information sources**: Scopus, Web of Science, IEEE Xplore, ACM DL, arXiv (note placeholder exports if offline).
- **Search strings**: Combine manufacturing scheduling synonyms with RL terms (e.g., `"reinforcement learning" AND ("job shop" OR "flow shop" OR "manufacturing scheduling")`).
- **Eligibility criteria**:
  - Inclusion: peer-reviewed (or high-impact preprints), manufacturing focus, RL-driven scheduling, 2014–present primary; add pivotal older papers.
  - Exclusion: domains outside manufacturing, heuristic-only methods w/o RL, surveys lacking scheduling outcomes.
- **Screening process**: Dual-stage (title/abstract, then full-text) logged by the Screening Agent; maintain counts for identification → screening → eligibility → inclusion.
- **Data extraction**: Standardized template for KPIs, datasets/simulators, benchmark comparisons, scalability notes.
- **Risk of bias / quality**: Evaluate study design, reproducibility, baselines, and reporting completeness.

## 6. Thesis Structure (proposed)
1. **Front matter**: Title, abstract (English), acknowledgements.
2. **Chapter 1 – Introduction**: Problem framing, contributions, overview of multi-agent support workflow.
3. **Chapter 2 – Background**: Manufacturing scheduling, RL fundamentals, evaluation metrics.
4. **Chapter 3 – Methodology**: PRISMA process, data sources, agent roles, tooling.
5. **Chapter 4 – Literature Landscape**: Descriptive stats (temporal trends, domains, objectives, RL methods).
6. **Chapter 5 – Comparative Analysis**: Deep dives by manufacturing scenario and RL approach, pros/cons, deployment readiness.
7. **Chapter 6 – Multi-Agent Support Case Study**: Detail how specialized LLM agents assist research, including pipelines and automation scripts.
8. **Chapter 7 – Discussion & Future Work**: Gaps, challenges (data scarcity, interpretability), roadmap for agent-enhanced reviews.
9. **Chapter 8 – Conclusion**.
10. **Appendices**: PRISMA tables, search strategies, extended data extraction sheets, Slidev instructions.

## 7. Slidev Presentation Outline
- ~15–20 slides grouped as: intro, methodology, PRISMA results, key findings by scheduling class, agent workflow, implications, future work.
- Auto-generation: script pulls highlighted figures/tables (PDF exports or CSV charts) and injects into `slides.md`.
- Theme reflecting thesis branding (color palette consistent with template).

## 8. Tooling & Automation
- **Language**: LaTeX (KOMA-Script) + BibTeX via `natger.bst` or updated bibliography style.
- **Build**: `latexmk` pipeline; add `Makefile`/`justfile` for reproducible builds (thesis + Slidev).
- **Data**: Store extracted metadata in `data/` (CSV + JSON). Provide Python notebooks/scripts for agent simulations.
- **Slidev**: Use Node + Slidev (v0.43+). Document npm commands; ensure offline-friendly assets.

## 9. Risks & Mitigations
- **Limited internet**: Provide placeholders and instructions for adding real search exports later.
- **Volume (200 papers)**: Automate extraction templates and maintain per-paper summaries via agent scripts.
- **Consistency between thesis & slides**: Shared data sources, automated chart exports.
- **Time**: Prioritize methodology + automation scaffolding early; integrate content iteratively.

## 10. Acceptance Criteria
- Spec approved by stakeholders before writing content.
- LaTeX build succeeds without manual template tweaks beyond documented changes.
- PRISMA artifacts reproducible from logged data.
- Slidev deck rebuilds from CLI command documented in README/Makefile.

