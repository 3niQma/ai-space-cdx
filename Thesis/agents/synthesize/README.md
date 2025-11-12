# Synthesis Agent

**Goal:** Transform structured metadata into narratives, figures, and insights for Chapters \ref{ch:landscape}–\ref{ch:comparative}.

## Responsibilities
- Summarize trends by manufacturing domain, RL paradigm, and objective function.
- Draft bullet-ready insights for later expansion within the thesis.
- Export intermediate prose to `data/processed/synthesis_notes.md` for downstream reuse.

## Workflow
1. Load the latest `data/processed/study_catalog.csv`.
2. Generate descriptive paragraphs, highlight representative papers, and note evidence strength.
3. Provide chart specifications (e.g., JSON configs) for visualization scripts.

## Prompts / Guidance
- Quantify statements whenever possible (counts, percentages).
- Surface contradictory findings and contextual factors (dataset choice, reward tuning).
- Annotate direct quotes/paraphrases with citation keys to streamline LaTeX integration.
