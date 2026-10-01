# Phase 08 — Ask

**Day 3 morning · ~4 h**

## Objective
A learner asks a question in plain language and gets a short answer grounded only in the library, where every claim cites a moment that plays as a clip — or an honest "not covered in this library."

## Context
`AI_EVALUATION.md` is the full spec (retrieval, prompt, validation, fallback). `API.md` (`POST /api/ask`), `SECURITY.md` (rate limits, injection).

## Prerequisites
Phases 06 (retrieval), 07 (`momentUrl`, MomentSheet). `ANTHROPIC_API_KEY` set; Anthropic console spend limit set.

## Tasks
1. `src/lib/retrieve.ts` — OR-ed tsquery, top 12, ±1 neighbour expansion, de-dupe.
2. `src/lib/claude.ts` — one call to `claude-sonnet-5-5` with the system prompt from `AI_EVALUATION.md`, structured output `{ answer, cited_segment_ids }`, 15 s timeout.
3. `src/lib/citations.ts` — **pure** `validateAnswer(raw, retrievedIds) → { status, answer, citations }`: schema check, drop unknown IDs, strip unvalidated markers, renumber `[1]..[n]`, zero survivors → `not_found`.
4. `src/lib/rate-limit.ts` — Postgres `ask_requests` check + insert (20/h per IP hash, 500/day global).
5. `POST /api/ask` — validate → rate-limit → retrieve (none → `not_found` without calling Claude) → Claude → validate → attach `momentUrl` per citation. Claude failure → `fallback` with top 4 segments.
6. UI on `/search?q=`: **Answer** card on top (skeleton while loading; retrieved clip cards render first), citation chips `[1]` scroll to and highlight the clip card; each card: play inline (Moment or 16:9 trimmed), "Open full session", "Share as Moment". `not_found` and `fallback` states are designed, not error pages.

## Files to Create
`src/lib/retrieve.ts`, `src/lib/claude.ts`, `src/lib/citations.ts`, `src/lib/rate-limit.ts`, `src/app/api/ask/route.ts`, `src/components/AnswerCard.tsx`, `src/components/CitationCard.tsx`, `tests/unit/citations.test.ts`, `tests/eval/ask-questions.json`, `scripts/eval-ask.mjs`

## Cloudinary Requirements
Every citation renders a Cloudinary clip (trim) and offers a Moment.

## AI Requirements
Exactly as `AI_EVALUATION.md`. Use the `claude-api` skill reference when writing `claude.ts` (structured outputs, timeouts) — don't write the SDK call from memory.

## Security Requirements
Rate limit before any Claude call; no tools given to Claude; answer rendered as text; only retrieved IDs can be cited.

## Testing Requirements
Unit (`citations.test.ts`): valid IDs kept, hallucinated IDs dropped, markers renumbered, all-invalid → `not_found`, malformed JSON → throws (→ fallback). Eval: `pnpm eval:ask` — record results in `AI_EVALUATION.md`.

## Acceptance Criteria
Given an answerable question, the answer cites ≥1 clip from the right session(s); given an off-topic question ("who won the IPL?"), the response is `not_found`; with the API key removed, the response is `fallback` with clips — never a 500.

## Definition of Done
The demo sequence in `IMPLEMENTATION_PLAN.md` works end to end on the deployed URL.
