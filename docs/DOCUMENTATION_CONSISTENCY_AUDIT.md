# Documentation Consistency Audit — Pravaha

## Audit 2 — Oct 1, 2026 (v2 re-scope)

Every v2 doc cross-checked after the re-scope.

| Check | Result |
|---|---|
| Every FR in `PRD.md` has an endpoint in `API.md` / `openapi.yaml` and a phase in `IMPLEMENTATION_PLAN.md` | Consistent |
| `DATABASE.md` schema matches the queries described in `API.md`, `AI_EVALUATION.md`, phase docs | Consistent (3 tables) |
| Env vars in `.env.example` = `SECURITY.md` secrets table = `SETUP.md` | Consistent |
| Claude scope (Ask only, `claude-sonnet-5-5`) identical in `TRD.md`, `DECISIONS.md`, `AI_EVALUATION.md`, `COST.md`, Phase 08 | Consistent |
| Chaptering = Cloudinary `auto_chaptering` everywhere; no remaining custom-algorithm references in v2 docs | Consistent |
| FTS config = `english` in `DATABASE.md` and `DECISIONS.md` | Consistent |
| Auth = passcode cookie in `TRD.md`, `SECURITY.md`, `API.md`, `ARCHITECTURE.md`, Phase 03 | Consistent |
| Git rules in `GIT_WORKFLOW.md`, `CONTRIBUTING.md`, PR template | Consistent |

### Known leftovers

- `docs/phases/` still contains the **v1 phase specs** (`PHASE-01-cloudinary-wiring.md` … `PHASE-13-demo-prep.md`). They're superseded by the v2 files (`PHASE-01-cloudinary-spike.md` … `PHASE-10-ship.md`) and should be deleted; `IMPLEMENTATION_PLAN.md` lists only v2 phases.
- Items marked **[verify P01]** in `CLOUDINARY.md` are deliberate open questions, closed by Phase 01.

## Audit 1 — pre-build (v1)

Found one inconsistency (FR9 chapter- vs. lecture-level tags) and fixed it. Superseded by the v2 re-scope.
