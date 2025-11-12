# Multi-Agent Workflow

This directory will host prompt templates, configuration files, and scripts that emulate specialized LLM agents:

1. `search` – query generation & database coverage.
2. `screen` – title/abstract relevance classification.
3. `extract` – metadata capture into structured tables.
4. `synthesize` – narrative drafting components.
5. `critic` – quality checks, PRISMA compliance.
6. `present` – synchronization with the Slidev deck.

Each agent folder will include:
- Prompt/instruction set (`*.md`).
- Automation script or notebook (Python) for batch execution.
- Log outputs (`logs/`) to trace decisions.
