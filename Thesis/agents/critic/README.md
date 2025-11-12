# Critic Agent

**Goal:** Audit the completeness and consistency of the review, ensuring PRISMA fidelity and reproducibility.

## Responsibilities
- Cross-check `data/prisma/flow_counts.csv` with screening logs.
- Validate that every cited study has metadata entries and traceable decisions.
- Produce QA notes in `data/processed/qa_report.md`, flagging gaps or action items.

## Workflow
1. Compare counts between search, screening, and extraction stages.
2. Sample entries for manual verification and log findings.
3. Provide acceptance criteria before the Presentation Agent updates slides.

## Prompts / Guidance
- Treat conflicting information (e.g., missing RL details) as blockers until resolved.
- Recommend additional searches when clusters or time periods are underrepresented.
- Document assumptions transparently to support future replication.
