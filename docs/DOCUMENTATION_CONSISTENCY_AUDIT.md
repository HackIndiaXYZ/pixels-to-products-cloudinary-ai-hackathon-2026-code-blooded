# Documentation Consistency Audit — Pravaha

## Audit 3 — Oct 1, 2026 (v3 + Phase 16)

| Check | Result |
|---|---|
| `openapi.yaml` covers every route in `src/app/api` (incl. v3 study-pack, events, insights, Answer Reel) | Fixed — validated with Redocly |
| No current-state doc names Claude/Anthropic as the AI provider (historical records — v1 archive, Phase 08, superseded `DECISIONS.md` rows, Strategy Revisit — keep it on purpose) | Fixed |
| Moment captions described as timed `l_text` cards, not `l_subtitles` | Fixed |
| Merge strategy = merge commit in `GIT_WORKFLOW.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md` | Fixed |
| `ARCHITECTURE.md` ingest sequence matches the two-step create → sign flow | Fixed |
| Log event names in `OBSERVABILITY.md` match the code (`ai.error`) | Fixed |


## Audit 2 — Oct 1, 2026 (v2 re-scope)

Every v2 doc cross-checked after the re-scope.

| Check | Result |
|---|---|
| Every FR in `PRD.md` has an endpoint in `API.md` / `openapi.yaml` and a phase in `IMPLEMENTATION_PLAN.md` | Consistent |
| `DATABASE.md` schema matches the queries described in `API.md`, `AI_EVALUATION.md`, phase docs | Consistent (3 tables) |
| Env vars in `.env.example` = `SECURITY.md` secrets table = `SETUP.md` | Consistent |
| AI layer = Gemini with a model fallback chain (`src/lib/ai.ts`) in `TRD.md`, `DECISIONS.md`, `AI_EVALUATION.md`, `COST.md`, `SECURITY.md`, `SETUP.md`, Phase 11 (Phase 08 records the original Claude design) | Consistent (Oct 1, v3) |
| Chaptering = Cloudinary `auto_chaptering` everywhere; no remaining custom-algorithm references in v2 docs | Consistent |
| FTS config = `english` in `DATABASE.md` and `DECISIONS.md` | Consistent |
| Auth = passcode cookie in `TRD.md`, `SECURITY.md`, `API.md`, `ARCHITECTURE.md`, Phase 03 | Consistent |
| Git rules in `GIT_WORKFLOW.md`, `CONTRIBUTING.md`, PR template | Consistent |

### Known leftovers

- The **v1 phase specs** are archived in `docs/phases/archive-v1/` with a superseded note; `IMPLEMENTATION_PLAN.md` lists only v2 phases.
- All **[verify P01]** items in `CLOUDINARY.md` were closed on Oct 1 against real Cloudinary output (Phase 01 findings).

## Audit 1 — pre-build (v1)

Found one inconsistency (FR9 chapter- vs. lecture-level tags) and fixed it. Superseded by the v2 re-scope.
