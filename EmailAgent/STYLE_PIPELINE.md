# Style Extraction Plan

## Goals
- Capture Noah Klarmann’s writing style per audience category: students (Sie), colleagues (Du), industry/research partners.
- Keep all processing local using the anonymized Markdown corpus under `../../EmailsAnonymize/EmailsAnonymous_anonymized`.
- Persist a reusable style profile that the UI + future RAG layer can load without re-parsing thousands of emails every time.

## Pipeline
1. **Parse emails**  
   - Script: `scripts/build-style-profile.mjs`.  
   - Recursively walks the anonymized directory, reads each Markdown file, parses frontmatter + body.  
   - Filters to messages authored by Noah (`**From:** Klarmann, Noah`).  
   - Normalizes the body (drops headers, quoted metadata, Markdown decorations) before analysis.

2. **Heuristic classifier**  
   - Students: keywords such as `studierende`, `klausur`, `vorlesung`, `thesis`, `modul`, etc., or general formal tone (Sie pronouns) when no stronger signal exists.  
   - Colleagues: recipient line containing faculty cues (`wi-`, `prof`, `team`) or informal pronoun dominance (Du, dich, dir).  
   - Industry/research: keywords like `GmbH`, `AG`, `Angebot`, `NDA`, `Kooperation`, `Kunde`, `Startup`.  
   - Fallback order: industry → students → colleagues to keep the per-Sie default when signals conflict.

3. **Feature extraction per category**  
   - Token stats: average words per email, average sentence length, punctuation density.  
   - Tone markers: informal/formal pronoun usage, emoji rate, exclamation frequency.  
   - Template phrases: most common greetings, closings, signature lines (short lines only, de-duped).  
   - Exemplars: first five subjects per category for quick manual inspection/reference.

4. **Output**  
   - Writes `src/features/style/styleProfiles.json` with a timestamp, sample size, and category breakdown.  
   - The JSON acts as the single source of truth for front-end helpers and future LLM prompts.

## Usage
```bash
# Rebuild the style profile (optionally limit the number of processed mails for faster iteration)
node scripts/build-style-profile.mjs [--input <path>] [--limit <n>]
```
- Default input path: `../../EmailsAnonymize/EmailsAnonymous_anonymized`.  
- Output is always overwritten at `src/features/style/styleProfiles.json`.  
- The script runs purely offline and finishes in ~3s for ~6.2k mails on a laptop.

## Next Steps
- Wire a small helper in `src/features/style` to load the JSON and offer ready-to-use templates per category (greeting, closing, pronoun preference).  
- Optionally let the classifier emit probabilities so we can override edge cases (JSON map of manual corrections).  
- Feed the same parsed dataset into the upcoming embedding/indexing pipeline so we don’t duplicate I/O work.
