# EmailAgent2 – AI Email Response Generator

EmailAgent2 helps Noah Klarmann reply to high-volume inboxes quickly. Agents paste an incoming email, describe Noah’s intent in a single sentence, and the app sends both through OpenAI’s chat completions API to craft a polished response. Personally identifiable information stays private thanks to a reversible client-side anonymization layer that must never obfuscate Noah’s name.

## Tech Stack

- React 18 + TypeScript + Vite 7
- Material UI 7 (Paper/Stack layout, buttons, alerts)
- Custom anonymization utilities (regex mappings, reversible placeholders)
- OpenAI Chat Completions API (via `fetch`)
- Vitest + Testing Library for automated checks

## Project Structure

```
src/
├── components/         # Email input, intent input, response display, status panel, header
├── features/
│   ├── anonymization/  # Regex definitions, mapping helpers, type exports
│   └── llm/            # Prompt builder, API client, config + pricing constants
├── hooks/              # useAnonymization, useLLMGeneration, useClipboard
├── __tests__/          # Vitest suites (anonymization + UI)
├── types/              # Shared interfaces (TokenUsage, mappings, API requests)
├── App.tsx             # Main workflow + layout
└── main.tsx            # Entry + theme bootstrap
```

## Getting Started

1. `npm install`
2. Copy `.env.example` → `.env.local`, then populate:
   - `VITE_OPENAI_API_KEY=sk-openai-...`
   - `VITE_OPENAI_MODEL=gpt-4o-mini` (optional override)
   - `VITE_OPENAI_MAX_TOKENS=600` (optional override)
3. `npm run dev` and open `http://localhost:5173`

## Core Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Type-check + production bundle (outputs `dist/`) |
| `npm run preview` | Serve the built assets locally |
| `npm run lint` | ESLint flat config across src + config files |
| `npm run test` | Vitest (jsdom) for anonymization + UI |
| `npm run test:coverage` | Vitest in coverage mode |

## Development Workflow

1. Paste the original email and run “Anonymize” (client-side regex swaps names, emails, phone numbers, and companies with deterministic placeholders—Noah Klarmann is preserved).
2. Enter a ≤200 character intent (e.g., “accept meeting but ask for agenda”).
3. Press “Generate Response”; the app calls OpenAI with the anonymized (or original) text using the prompt in `features/llm/prompts.ts`.
4. Review the response in the right panel, toggle edit mode if tweaks are needed, then copy or de-anonymize before sending.

The status panel surfaces API key issues, anonymization errors, and loading states; usage metrics show token counts and estimated USD cost.

## Testing & QA

- Automated: `npm run test` exercises anonymization mappings and the response display controls. Extend `src/__tests__` with new suites as features grow.
- Manual scenarios (before merges or releases):
  1. Basic flow – paste email → intent → generate → copy.
  2. Anonymization flow – anonymize → generate → de-anonymize.
  3. Error handling – remove API key, force network errors (e.g., disable network), confirm alerts.
  4. Edge cases – long emails (>2000 chars), multiple names, signatures, forwarded threads.
  5. GDPR verification – ensure Noah Klarmann never anonymizes; confirm placeholders map back 1:1.

## Privacy & Security

- Never check API keys into source control. Use `.env.local`, which remains ignored.
- All anonymization happens in the browser before invoking OpenAI.
- Production deployments must proxy OpenAI traffic server-side to hide API keys, add rate limiting, and enable observability (Sentry, Datadog, etc.).
- Before sharing logs/screens, scrub sample emails and placeholder mappings.

## Deployment Notes

1. `npm run build`
2. Host the `dist/` directory (Vercel, Netlify, or any static host).
3. For production, move the OpenAI API key into a backend proxy and update `features/llm/openaiApi.ts` to point to that proxy. Document the change for agents so they can still run the dev client with `.env.local`.
