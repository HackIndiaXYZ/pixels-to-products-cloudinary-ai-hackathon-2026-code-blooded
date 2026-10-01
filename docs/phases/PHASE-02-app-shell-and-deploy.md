# Phase 02 — App Shell + Deploy

**Day 1 · ~2 h**

## Objective
A real Next.js app — styled, linted, type-checked — deployed to Vercel with a public URL, so the webhook has a real target from the first real upload.

## Context
Phase 00 left `package.json` and `tsconfig.json` but no app files, no ESLint config and no Next config — CI would fail on `lint` and `typecheck` today. This phase makes CI green.

## Prerequisites
Phase 00. Vercel account linked to the GitHub repo (`SETUP.md`).

## Tasks
1. Dependencies: add `next-cloudinary`, `tailwindcss` + `@tailwindcss/postcss`, `server-only`; remove `next-auth` (superseded — `DECISIONS.md`).
2. `next.config.ts` (allow `res.cloudinary.com` images), `postcss.config.mjs`, `eslint.config.mjs` (`eslint-config-next` flat config), `vitest.config.ts`.
3. `src/app/layout.tsx` with Inter via `next/font`, `src/app/globals.css` with the design tokens from `DESIGN_SYSTEM.md` (light + dark).
4. `src/app/page.tsx` — the hero (wordmark, tagline "Ask your recordings. Watch the answer.", a disabled Ask bar) — placeholder until Phase 07.
5. `src/lib/env.ts` — Zod-parse `process.env` once at startup; fail fast with a readable error naming the missing variable.
6. Fix CI: `vitest run --passWithNoTests`; replace the `--grep` integration job (Vitest has no `--grep`) — drop it; Cloudinary is verified manually (Phase 01) and by the deployed smoke test (Phase 09).
7. Import the repo in Vercel, set env vars, deploy. Set `APP_URL` to the production URL.

## Files to Create
`next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/lib/env.ts`

## Files to Modify
`package.json`, `.github/workflows/ci.yml`, `.env.example` (already v2)

## Cloudinary / AI Requirements
None yet.

## Security Requirements
`env.ts` is `server-only`; only `NEXT_PUBLIC_*` values reach the client.

## Testing Requirements
`pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass locally and in CI.

## Acceptance Criteria
Given a push to `main`, CI is green and Vercel serves the hero page on a public HTTPS URL, on desktop and phone.

## Definition of Done
Public URL works; CI green; `APP_URL` set in Vercel.
