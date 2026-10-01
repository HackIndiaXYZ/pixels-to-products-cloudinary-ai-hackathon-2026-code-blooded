# Security — Pravaha

## Trust Boundaries

| Boundary | Who's on the other side | Control |
|---|---|---|
| Studio + organizer API | Anyone on the internet | Passcode → signed cookie |
| `/api/webhooks/cloudinary` | Anyone on the internet | Cloudinary signature over raw body + timestamp freshness |
| `/api/ask` | Anyone; costs money per call | Zod validation, per-IP + global rate limit, Anthropic spend cap |
| `/api/search`, lecture reads | Anyone | Zod validation, parameterized SQL, public+ready filter |
| Claude | Untrusted transcript text inside the prompt | No tools, schema output, citation validation |

## Organizer Authentication

- `ORGANIZER_PASSCODE` (≥ 24 random chars) compared with `crypto.timingSafeEqual` on equal-length SHA-256 digests.
- On success, cookie `pravaha_org` = `<expiry>.<HMAC-SHA256(SESSION_SECRET, "org:" + expiry)>`; HttpOnly, Secure, SameSite=Lax, 7-day expiry. Verified on every organizer route; expired or tampered → `401`.
- No user table, no passwords stored. Upgrade path: NextAuth with institute workspaces (`DECISIONS.md`).
- CSRF: organizer mutations are JSON `POST`/`PATCH` with SameSite=Lax cookies and a `Content-Type: application/json` requirement — a cross-site form post can't produce that.

## Secrets

| Variable | Scope |
|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Public (identifies the account) |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Public (useless without a signature) |
| `CLOUDINARY_API_SECRET` | **Server-only** — signs uploads, verifies webhooks |
| `DATABASE_URL` | Server-only |
| `ANTHROPIC_API_KEY` | Server-only |
| `ORGANIZER_PASSCODE`, `SESSION_SECRET` | Server-only |
| `APP_URL` | Config (webhook URL base) |

Server modules (`src/lib/cloudinary.ts`, `db.ts`, `claude.ts`, `auth.ts`) import `server-only`. `.env*.local` is git-ignored; `.env.example` holds names only. Before every push: `git diff --cached | grep -iE "secret|api_key|passcode|postgres://"` must be empty of values.

## Upload Security

Signed uploads only (the upload preset is **signed**, so an unsigned upload with our cloud name is rejected). The server chooses `public_id` and `notification_url`; client-supplied values for those are ignored. The preset restricts to video formats and 500 MB.

## Webhook Security

Verify `X-Cld-Signature` over the **raw** body + `X-Cld-Timestamp` with the SDK helper before `JSON.parse`; reject timestamps older than 2 hours (replay). The transcript is then fetched from **our own** Cloudinary CDN URL built from the `public_id` in our DB — never from a URL in the payload (no SSRF).

## Input Validation & Output Encoding

Zod on every body and query. SQL is parameterized only. `ts_headline` snippets are HTML-escaped first, then only `<b>` markers are re-allowed. Claude's answer is rendered as plain text with citation chips — never `dangerouslySetInnerHTML`.

## Prompt Injection

Covered in `AI_EVALUATION.md`: no tools, schema-only output, citations limited to retrieved IDs, refusal when nothing survives. A transcript can at worst shape the wording of an answer that still links to real footage.

## Abuse & Cost Controls

- `/api/ask`: 20/hour per IP hash, 500/day global (Postgres `ask_requests`), `429` + `Retry-After`. Anthropic console monthly spend limit set during setup.
- Moments: bounded to ≤ 60 s clips at 720 p — a learner can't request a full-length derived video.
- Cloudinary usage checked daily during the build.

## Privacy & Consent

Rights confirmation is required before upload (`rights_confirmed_at`), sessions default to `unlisted`, and only `public` sessions are searchable or askable. Logs carry `lectureId`, never transcript text; IPs only as salted hashes.

## OWASP Top 10, Briefly

| Risk | Here |
|---|---|
| Injection | Parameterized SQL; schema-validated LLM output |
| Broken auth | HMAC cookie, timing-safe compare, expiry |
| Broken access control | Organizer check on every mutating route; public queries hard-filter `public`+`ready` |
| SSRF | Webhook never fetches payload-supplied URLs |
| XSS | No raw HTML except escaped `<b>` in snippets |
| Security misconfiguration | Signed upload preset; secrets server-only |
| Vulnerable deps | `pnpm audit` in CI, Dependabot |
