# Screening Agent

**Goal:** Apply PRISMA-compliant inclusion/exclusion criteria to titles and abstracts produced by the Search Agent.

## Responsibilities
- Deduplicate entries within and across databases.
- Label each record with `abstract_decision` (include/exclude) and `fulltext_decision`.
- Capture exclusion reasons using a controlled vocabulary (OOS-domain, non-RL, non-manufacturing, insufficient details, etc.).

## Workflow
1. Import search exports from `data/prisma/search_log.csv` and corresponding raw files under `data/raw/`.
2. Update `data/prisma/screening_log.csv` using columns: `paper_id,title,abstract_decision,fulltext_decision,reason,notes`.
3. Provide inclusion counts to the Extraction Agent and update `data/prisma/flow_counts.csv`.

## Prompts / Guidance
- Favor manufacturing-specific evaluations (physical or simulated production lines).
- Require explicit RL-driven scheduling (pure heuristics or deterministic OR-only methods are excluded).
- Prefer peer-reviewed outlets; label preprints clearly in the notes when included.
