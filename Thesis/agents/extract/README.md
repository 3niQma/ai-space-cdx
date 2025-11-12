# Extraction Agent

**Goal:** Convert accepted studies into structured metadata driving descriptive statistics and comparative analysis.

## Responsibilities
- Populate `data/processed/study_catalog.csv` with fields:
  `paper_id,title,year,manufacturing_domain,rl_method,baseline,kpis,notes`.
- Track benchmark datasets/simulators, reward shaping strategy, training horizon, and deployment evidence.
- Flag missing data or questionable claims for the Critic Agent.

## Workflow
1. Consume the `include` subset from `data/prisma/screening_log.csv`.
2. Store supplemental material (tables, figures) in `data/processed/` using consistent naming.
3. Trigger descriptive statistics scripts (to be added) before handing off to the Synthesis Agent.

## Prompts / Guidance
- Normalize RL method names (e.g., “DQN”, “DDPG”, “PPO”, “Graph RL”, “MA-RL”).
- Distinguish between simulation-only and real factory demonstrations.
- Capture multi-objective setups explicitly (comma-separated list in `kpis`).
