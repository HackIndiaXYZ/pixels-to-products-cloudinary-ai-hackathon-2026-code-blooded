# Phase 03 — Studio: Organizer Auth + Upload

**Day 1 · ~2.5 h**

## Objective
An organizer signs in with the passcode, fills title/speaker, confirms recording rights, and uploads a video straight to Cloudinary with transcription and chaptering requested — and sees it appear in the Studio as `processing`.

## Context
`API.md` (organizer session, upload-signature, lectures), `SECURITY.md` (cookie design, signed upload), `UX_UI.md` (Studio).

## Prerequisites
Phases 01, 02. Neon database created and **`migrations/001_init.sql` applied now** (the upload route writes the lecture row), signed upload preset `pravaha_signed` created (`SETUP.md`).

## Tasks
1. `migrations/001_init.sql` exactly as in `DATABASE.md`; apply via Neon SQL editor.
2. `src/lib/db.ts` — one pooled `pg.Pool`, a tiny `query<T>()` helper.
3. `src/lib/auth.ts` — `checkPasscode()`, `issueOrgCookie()`, `isOrganizer(request)` (HMAC, timing-safe, expiry).
4. `POST/DELETE /api/organizer/session`.
5. `POST /api/upload-signature` — validates body, inserts lecture, returns signed params with server-chosen `public_id = pravaha/<uuid>`, `auto_transcription`, `auto_chaptering`, `notification_url`, `upload_preset`. Uses `cloudinary.utils.api_sign_request`.
6. `/studio` page: passcode form (if not organizer) → upload form (title, speaker, **rights checkbox required**) → `CldUploadWidget` (signed, video only) with real progress → on success, the row appears with a `processing` badge.
7. Studio list: `GET /api/lectures` (organizer view), status badges, polling every 5 s while anything is `processing`.

## Files to Create
`migrations/001_init.sql`, `src/lib/db.ts`, `src/lib/auth.ts`, `src/lib/cloudinary.ts`, `src/app/api/organizer/session/route.ts`, `src/app/api/upload-signature/route.ts`, `src/app/api/lectures/route.ts`, `src/app/studio/page.tsx`, `src/components/UploadForm.tsx`, `src/components/StatusBadge.tsx`

## Cloudinary Requirements
Signed upload via preset; server-chosen `public_id`; `auto_transcription` + `auto_chaptering` + `notification_url` signed server-side (Phase 01's confirmed param shapes).

## AI Requirements
None.

## Security Requirements
`401` on every organizer route without a valid cookie; client-sent `public_id`/`notification_url` ignored; rights checkbox enforced server-side (`rightsConfirmed: true` literal in Zod).

## Testing Requirements
Unit: cookie issue/verify (valid, tampered, expired). Manual: upload without the checkbox is impossible; upload without the cookie gets `401`.

## Acceptance Criteria
Given the passcode, an organizer uploads a 5-minute video from a phone on the deployed URL; it reaches Cloudinary with `auto_transcription: pending`, and the Studio shows it as `processing` + `unlisted`.

## Definition of Done
Deployed Studio uploads real video; `auth.test.ts` passes.
