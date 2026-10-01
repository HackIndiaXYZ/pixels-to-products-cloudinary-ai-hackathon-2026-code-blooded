# Phase 05 — Ingest: Webhook → Segments

**Day 2 · ~3 h**

## Objective
When Cloudinary finishes transcribing, the webhook turns the word-level transcript into time-coded ~10-second segments in Postgres, tags them with chapter titles, and flips the session to `ready` — with no human step.

## Context
`API.md` (webhook), `DATABASE.md` (segments, idempotent write), `SECURITY.md` (signature, SSRF), Phase 01 Findings (real payloads).

## Prerequisites
Phases 01, 03 (schema applied, lectures exist before upload).

## Tasks
1. `src/lib/segments.ts` — **pure** `buildSegments(lines, chapters?) → Segment[]`: flatten words, cut at the first sentence end after 8 s, hard cap 15 s, attach the chapter title whose range contains the segment start.
2. `src/lib/chapters.ts` — parse the chapters file (VTT → `{startS, endS, title}[]`) if Phase 01 found one; empty array otherwise.
3. `POST /api/webhooks/cloudinary` — read raw body → verify signature + timestamp → parse → look up lecture by `public_id` → on `auto_transcription` complete: fetch transcript (+ chapters) from our CDN URL, `buildSegments`, transaction (delete, batch insert, status `ready`, `duration_s`) · on failed: `transcript_failed`.
4. Structured logs at every branch with `lectureId` (`OBSERVABILITY.md`).
5. Studio badge flips to `ready` via the existing polling; a `ready` toast.

## Files to Create
`src/lib/segments.ts`, `src/lib/chapters.ts`, `src/app/api/webhooks/cloudinary/route.ts`, `tests/unit/segments.test.ts`, `tests/unit/chapters.test.ts`, `tests/unit/webhook-signature.test.ts`, `tests/fixtures/spike.transcript.json` (from Phase 01, trimmed)

## Cloudinary Requirements
`notification_url` (set in Phase 03), `verifyNotificationSignature`, transcript + chapters raw assets on the CDN.

## AI Requirements
None.

## Security Requirements
Signature verified on the raw body **before** parsing; stale timestamps rejected; transcript fetched only from a URL we build, never one from the payload.

## Testing Requirements
Unit: segment boundaries (sentence cut, hard cap, empty transcript, single long word run), chapter assignment, VTT parsing. Manual: replay the same webhook twice → identical row count.

## Acceptance Criteria
Given a valid completion webhook, segments exist and status is `ready` within seconds. Given a bad signature, `401` and zero DB writes. Given a duplicate delivery, no duplicate segments.

## Definition of Done
All library sessions uploaded today become `ready` automatically; unit tests pass.
