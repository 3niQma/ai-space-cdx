# Search Agent

**Goal:** Curate exhaustive keyword combinations and database queries covering reinforcement learning for manufacturing scheduling (job-shop, flow-shop, flexible, hybrid, semiconductor).

## Responsibilities
- Maintain master keyword ontology (RL terms, manufacturing processes, objectives).
- Craft database-specific search strings (Scopus, Web of Science, IEEE Xplore, ACM DL, arXiv).
- Log executed searches with timestamps, filters, and hit counts into `data/prisma/search_log.csv`.

## Workflow
1. Load/extend `data/raw/*.txt` with exported search results or metadata.
2. Update `data/prisma/search_log.csv` with the following columns: `source, query, filters, export_date, hit_count`.
3. Notify the Screening Agent when new batches are ready via the automation log (future automation hook).

## Prompts / Guidance
- Emphasize manufacturing-only scope.
- Prefer publications from 2014 onward but include seminal works that established RL scheduling baselines.
- Record exclusions (e.g., logistics, cloud, generic job-shop without manufacturing context) in the notes column.
