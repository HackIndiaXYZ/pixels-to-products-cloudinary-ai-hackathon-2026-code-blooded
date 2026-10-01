# Phase 11 — Gemini AI Layer

**Status: DONE (Oct 1)** · branch `feature/gemini-answer-reels`

## Objective
Run every AI task in Pravaha (Ask today; Study Packs, highlight picking and query translation next) through one schema-validated function, on Gemini, with a model fallback chain that survives provider overload.

## Context
The team chose Gemini over Claude (`DECISIONS.md`). Live testing on Oct 1 found the newest Flash models returning `503 high demand` while others answered in about 3 s. A single model is a single point of failure during judging.

## Tasks (done)
1. `src/lib/ai.ts`: `generateJson(schema, { system, prompt, task })`, using `@google/genai` with `responseMimeType: application/json` + `responseJsonSchema` derived from the **same Zod schema** that validates the result, a per-attempt `AbortSignal.timeout`, and the chain `gemini-3.6-flash → gemini-3.1-flash-lite → gemini-3.5-flash-lite` (override with `GEMINI_MODELS`)
2. `src/lib/answer.ts`: Ask's grounded prompt (renamed from `claude.ts`); `citations.ts` validation unchanged
3. `GEMINI_API_KEY` is optional: without it Ask returns clips (`fallback`), never a 500
4. `@anthropic-ai/sdk` removed

## Validation (real calls, Oct 1)
| Model | Latency | Result |
|---|---|---|
| gemini-3.8-flash · gemini-flash-latest · gemini-3.7-flash | — | 503 high demand |
| gemini-3.6-flash | 2.8–3.7 s | correct `[S<id>]` citations |
| gemini-3.1-flash-lite | 3.1 s | correct citations |
| gemini-3.5-flash-lite | 1.2 s | answers; sometimes omits markers (the validator keeps listed ids) |

On the real two-session library: "How do I stop overfitting?" → `answered`, citing both lecturers; "Who won the IPL?" → `not_found`.

## Acceptance Criteria
Answerable → `answered` with valid citations; off-topic → `not_found`; no key or all models down → `fallback` with clips. ✅
