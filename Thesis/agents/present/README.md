# Presentation Agent

**Goal:** Keep the Slidev deck synchronized with the thesis by injecting updated figures, tables, and speaking points.

## Responsibilities
- Translate synthesis highlights into slide sections (agenda, methodology, findings, outlook).
- Reference shared assets (figures exported from LaTeX or Python scripts) without duplication.
- Track slide order and versioning inside `slidev/slides.md`.

## Workflow
1. Watch `data/processed/synthesis_notes.md` and visualization outputs.
2. Update Slidev front-matter metadata, bullet lists, and presenter notes.
3. Trigger `npm run build` (or `make slidev`) once data refresh is complete.

## Prompts / Guidance
- Maintain parallel structure with thesis chapters for easier cross-referencing.
- Highlight KPIs and sample studies with concise citations (Author, Year).
- Keep slides lightweight; detailed tables remain in the thesis/appendix.
