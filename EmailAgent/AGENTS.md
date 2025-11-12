# Repository Guidelines

## Project Structure & Module Organization
EmailAgent2 follows a Vite + React workspace rooted at the repo base. Place all application logic inside `src/`, grouped as `components/` (UI widgets such as `EmailInput.tsx`, `ResponseDisplay.tsx`), `features/` (domain modules like `anonymization/` and `llm/`), and `hooks/` (stateful helpers like `useAnonymization.ts`). Shared types live in `src/types/index.ts`. Static assets and the HTML shell stay in `public/`. Keep environment-specific configuration in `vite.config.ts` and `.env.local` (ignored) with secrets such as `VITE_OPENAI_API_KEY`.

## Build, Test, and Development Commands
- `npm install` — install React, MUI, Vite, and test tooling.
- `npm run dev` — launch the Vite dev server at `http://localhost:5173` with hot reload.
- `npm run build` — produce an optimized production bundle in `dist/`.
- `npm run preview` — serve the built assets locally to verify deployment output.
- `npm run test` — execute Vitest + Testing Library suites.
- `npm run test:coverage` — run Vitest in coverage mode for anonymization + UI suites.

## Coding Style & Naming Conventions
Use TypeScript with strict mode enabled and 2-space indentation. Name React components with PascalCase files (`ResponseDisplay.tsx`), hooks with `use` prefixes, and feature modules in camelCase (`tokenCost.ts`). Favor functional components with hooks; never mutate props. Apply ESLint via `npm run lint` before committing. Keep regex patterns centralized in `src/features/anonymization/` so replacements remain reversible and Noah Klarmann is excluded from anonymization rules.

## Testing Guidelines
Automated tests should target Vitest + React Testing Library (see `src/__tests__/`). Mirror file names (`ResponseDisplay.test.tsx`, `anonymization.test.ts`). For anonymization helpers, write deterministic unit tests using fixture emails that verify Noah Klarmann is preserved. Until the suite is complete, execute the manual scenarios outlined in `SPECIFICATION.md` (basic flow, anonymize/de-anonymize, error handling, long-email edge cases) before merging.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (`feat: add anonymizer mapping store`, `fix: enforce name preservation`). Each commit should compile (`npm run build`) and pass lint/tests. PRs must describe intent, reference related issues, and include screenshots or GIFs when UI changes are visible. Call out any GDPR-sensitive logic changes and detail how they were verified. Keep PRs scoped: one feature or fix per request to simplify review.

## Security & Configuration Tips
Never commit API keys; rely on `.env.local` and document required variables in `README` updates. When testing anonymization, redact sample emails before sharing logs. For deployments, route OpenAI calls through a backend proxy so browser builds never expose secrets, and enable rate limiting + error monitoring (e.g., Sentry) as soon as infrastructure exists.
