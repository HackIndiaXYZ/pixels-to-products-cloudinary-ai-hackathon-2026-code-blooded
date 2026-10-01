# Documentation Consistency Audit — Pravaha

## Audit 2 — Oct 1, 2026 (v2 re-scope)

Every v2 doc cross-checked after the re-scope.

| Check | Result |
|---|---|
| Every FR in `PRD.md` has an endpoint in `API.md` / `openapi.yaml` and a phase in `IMPLEMENTATION_PLAN.md` | Consistent |
| `DATABASE.md` schema matches the queries described in `API.md`, `AI_EVALUATION.md`, phase docs | Consistent (3 tables) |
| Env vars in `.env.example` = `SECURITY.md` secrets table = `SETUP.md` | Consistent |
| Claude scope (Ask only, `claude-opus-5-5`) identical in `TRD.md`, `DECISIONS.md`, `AI_EVALUATION.md`, `COST.md`, Phase 08 | Consistent |
| Chaptering = Cloudinary `auto_chaptering` everywhere; no remaining custom-algorithm references in v2 docs | Consistent |
| FTS config = `english` in `DATABASE.md` and `DECISIONS.md` | Consistent |
| Auth = passcode cookie in `TRD.md`, `SECURITY.md`, `API.md`, `ARCHITECTURE.md`, Phase 03 | Consistent |
| Git rules in `GIT_WORKFLOW.md`, `CONTRIBUTING.md`, PR template | Consistent |

### Known leftovers

- The **v1 phase specs** are archived in `docs/phases/archive-v1/` with a superseded note; `IMPLEMENTATION_PLAN.md` lists only v2 phases.
- All **[verify P01]** items in `CLOUDINARY.md` were closed on Oct 1 against real Cloudinary output (Phase 01 findings).

## Audit 1 — pre-build (v1)

Found one inconsistency (FR9 chapter- vs. lecture-level tags) and fixed it. Superseded by the v2 re-scope.
