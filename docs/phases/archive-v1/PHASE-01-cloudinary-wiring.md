# Phase 01 — Cloudinary Account + SDK Wiring

> **Superseded (v1 plan).** Kept for the record. The active specs are the v2 phases in `docs/phases/` — see `docs/IMPLEMENTATION_PLAN.md` and `docs/STRATEGY_REVISIT.md` (Revisit 2) for why the plan changed.

## Objective
Establish a working, correctly-configured connection between the application and Cloudinary — signed-upload capability and the server-side SDK client — that every later phase builds on.

## Context
This is the foundational integration point. Nothing about chaptering, playback, or search can be built until the app can reliably talk to Cloudinary. Per `docs/CLOUDINARY.md`, uploads go directly from the browser to Cloudinary using a server-generated signature — this phase builds that signing capability.

## Prerequisites
Phase 00 complete. A free Cloudinary account created, with `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` obtained and set in `.env.local` (never committed).

## Tasks
1. Configure the `cloudinary` SDK once, server-side, from environment variables
2. Build the signed-upload-parameters function: given a timestamp, generate a signature scoped to `resource_type: video` and a bounded `max_file_size`
3. Prove the signing function works against the real Cloudinary API (a real upload, not just a unit test)
4. Guard the module so it can only ever run server-side

## Files to Create
`src/lib/cloudinary.ts`, `tests/unit/cloudinary.test.ts`

## Files to Modify
None — nothing exists yet beyond the Phase 00 scaffold.

## Implementation Requirements
The API secret must never reach a file that could end up in a client bundle. Import Next.js's `server-only` at the top of `src/lib/cloudinary.ts` — it throws a build error if the file is ever pulled into client code by accident, which is a cheap, structural guardrail rather than a rule that relies on someone remembering.

## Cloudinary Requirements
Cloud name and API key from `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`; secret from `CLOUDINARY_API_SECRET`. Signed params carry a short expiry — a few minutes is enough for a one-time upload signature, not a standing credential — and cap `max_file_size` at 500MB (`docs/SECURITY.md`).

## AI Requirements
None in this phase.

## Security Requirements
Confirm — don't assume — that `CLOUDINARY_API_SECRET` never appears in the built client bundle. Check the actual build output, not just the source file structure; bundlers can surprise you. Cross-reference `docs/SECURITY.md`'s secrets table.

## Testing Requirements
Unit test the signing function against a known input/expected-signature pair — Cloudinary's signing algorithm is deterministic, so a fixed timestamp and fixed params must always produce the same signature. This is fully testable with no network call.

## Git Requirements
`feat(cloudinary): add signed upload client and signing function`

## Validation
A signature this function produces is accepted by a real upload request to Cloudinary's API — verified manually at least once, not just asserted by a unit test.

## Acceptance Criteria
Given valid upload parameters, when the signing function runs, then it produces a signature Cloudinary's API accepts for a real upload.

## Definition of Done
`src/lib/cloudinary.ts` exists, is provably server-only, is unit-tested, and has been manually verified against one real Cloudinary upload.
