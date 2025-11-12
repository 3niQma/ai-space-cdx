# Synthesis Notes (Batch 3)

## Publication Snapshot
- 47 curated studies spanning 2020–2025 across job-shop, flexible/hybrid flow-shop, semiconductor fabs (EUV, transfer, self-play, supply chain), batch/continuous/biopharma lines, microgrid/multi-microgrid factories, robot cells, aerospace assembly, remanufacturing lines, energy/carbon-aware multi-plant scheduling, and streaming digital twins.
- Yearly inclusion counts: 2 (2020), 5 (2021), 6 (2022), 7 (2023), 15 (2024), 12 (early 2025). Chart regenerated via \texttt{make data}.

- CNN/GNN feature extractors continue to aid generalization (Zhang 2020; Liu 2021; Huang 2024; Park 2024). Graph RL paired with digital twins accelerates transfer to pilot lines and streaming feedback loops.
- Cooperative and decentralized MARL remains effective for flow shops and disturbed job shops, especially when resilience bonuses are added \cite{Park2021MARLFJSP,Nguyen2022RobustMARL}. Multi-agent SAC extends to microgrid-integrated factories with carbon pricing and multi-carrier energy systems \cite{Almeida2022MicrogridMARL,Ghosh2024CarbonMicrogridRL}.
- Hierarchical RL decomposes hybrid flow shops, multi-microgrid plants, and aerospace assembly lines into stage-level policies \cite{Santos2021HierHFS,Sanchez2024AerospaceHRL,Rao2024HybridMOHRL}.
- Hybrid RL+OR methods broaden: CP-SAT refinements \cite{Kumar2023HybridRL}, NSGA-II collaboration for Pareto fronts \cite{Garcia2023MORL}, LSTM-enhanced PPO for tariff-aware energy scheduling \cite{Wang2023PPOEnergy}, multi-objective EV module schedulers \cite{Muller2023EVModuleRL}, transfer-learning policies for flexible aerospace cells \cite{Meier2025TransferAeroRL}, and multi-plant energy/carbon schedulers.
- Semiconductor fabs leverage Double DQN, policy gradients for EUV bottlenecks, SAC/self-play for energy-aware dispatch, graph RL for multi-cluster coordination, transfer learning across fabs, and supply-chain-spanning schedulers \cite{Lee2020WaferRL,Chen2022WaferMARL,Kim2023EUV,Li2022EnergyFabSAC,He2023TransferFab,Park2024ClusterGraphRL,Feng2025SelfPlayEUV}.

- Four studies move beyond pure simulation: two battery production pilots (FlexSim + streaming), flexible job shops with human-in-the-loop, and aerospace/robot cells in shadow mode. Deployment distribution (Figure~\ref{fig:deployment_counts}) still skews heavily toward simulation (43/47).
- Statistical testing remains uneven: paired tests/ANOVA reported in roughly half the studies; others rely on descriptive improvements or dominance checks.
- Code availability is effectively zero (one partial promise); simulator artifacts are mostly proprietary or custom (Table~\ref{tab:repro}).

## Next Actions
1. Expand screening to reach at least 50 included studies with emphasis on semiconductor fabs and high-mix assembly.
2. Capture availability of simulators/code per study for reproducibility scoring.
3. Add columns for statistical testing and deployment maturity in `study_catalog.csv`.
4. Generate visualizations (stacked bars, timeline) once dataset exceeds 30 entries.
