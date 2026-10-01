# Contributing

The full Git rules — branch per feature, PR, squash merge, keep local `main` current, no AI attribution — live in **`docs/GIT_WORKFLOW.md`**. Read it before the first commit.

## In One Screen

- `main` is always deployable. Never commit to it directly.
- Branch per feature: `feature/<name>` (also `fix/`, `docs/`, `chore/`).
- Conventional Commits: `feat(scope): …`, `fix(scope): …`, `docs: …`, `test: …`, `refactor: …`, `chore: …`.
- One PR per branch → CI green + Vercel preview works → squash merge → delete branch → `git checkout main && git pull --ff-only`.
- Commits and PRs carry only the team member's identity — no AI co-author trailers or "generated with" footers.
- No secrets in any diff, commit message or comment (`docs/SECURITY.md`).
- No `develop` branch: Vercel's preview-per-PR is the staging environment.

## Definition of Done (every PR)

Implements its phase doc's acceptance criteria, tests per `docs/TESTING.md`, any doc it makes inaccurate updated in the same PR, no secrets.
