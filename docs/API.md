# API Design — Pravaha

JSON in, JSON out. Errors: `{ "error": { "code": string, "message": string } }`. Times in seconds (floats). Every request body is validated with Zod before any side effect. Machine-readable version: `openapi.yaml`.

**Organizer** = request carries a valid `pravaha_org` cookie (`SECURITY.md`). Everything else is public.

---

### `POST /api/organizer/session` — sign in
- **Auth:** public
- **Request:** `{ "passcode": string }`
- **Response:** `204`, sets `pravaha_org` (HttpOnly, Secure, SameSite=Lax, 7 days)
- **Errors:** `400` bad body · `401` wrong passcode (constant-time compare)
- **Rate limit:** Vercel defaults; passcode is long and random (`SETUP.md`)

### `DELETE /api/organizer/session` — sign out
- Clears the cookie. `204`.

### `POST /api/lectures` — create a session (step 1 of upload)
- **Auth:** organizer
- **Request:** `{ "title": string(1–140), "speaker"?: string(≤80), "rightsConfirmed": true }`
- **Effect:** inserts `lectures` row (`processing`, `unlisted`, `rights_confirmed_at = now()`) with server-chosen `public_id = pravaha/<id>`
- **Response:** `201 { "lecture": Lecture, "uploadPreset": string }`
- **Errors:** `400` (incl. `rightsConfirmed` not `true`) · `401`

### `POST /api/upload-signature` — sign the widget upload (step 2)
- **Auth:** organizer
- **Contract:** `CldUploadWidget`'s `signatureEndpoint`: `{ "paramsToSign": {...} }` in, `{ "signature" }` out
- **Policy (`src/lib/upload-policy.ts`):** only the keys `public_id`, `upload_preset`, `timestamp`, `source`; preset must be ours; `public_id` must be an existing `processing` lecture; timestamp within 10 min. The AI params (`auto_transcription`, `auto_chaptering`, `notification_url`) live in the **signed upload preset**, so a client can't add or change them.
- **Errors:** `400` unsignable / unknown lecture · `401`

### `POST /api/webhooks/cloudinary`
- **Auth:** Cloudinary signature — `X-Cld-Signature` + `X-Cld-Timestamp` over the raw body, checked before parsing; timestamp older than 2 h rejected
- **Handles:** `info_kind: "auto_transcription"` → `complete`: fetch `{public_id}.transcript`, (fetch chapters if available), build segments, replace in one transaction, status `ready` · `failed`: status `transcript_failed`. Other notification types: `200` no-op.
- **Response:** `{ "received": true }`
- **Errors:** `401` bad signature (no DB write) · `200` for unknown `public_id` (logged — nothing to retry) · `500` only if the DB write fails, so Cloudinary retries
- **Idempotency:** delete-then-insert in a transaction; retries produce the same rows

### `GET /api/lectures/:id`
- **Auth:** public (unlisted = reachable by direct link); used by the Studio to poll status every 5 s
- **Response:** `{ id, title, speaker, status, visibility, durationS, publicId, createdAt }`
- **Errors:** `404`

### `PATCH /api/lectures/:id`
- **Auth:** organizer
- **Request:** `{ "visibility"?: "public" | "unlisted", "title"?: string, "speaker"?: string }`
- **Errors:** `400` (incl. publishing a session that isn't `ready`) · `401` · `404`

### `GET /api/lectures`
- **Auth:** public → `ready` + `public` only; organizer → all, with status (the Studio polls this every 5 s while anything is processing)
- **Response:** `[{ id, title, speaker, status, visibility, durationS, publicId, createdAt }]`

### `GET /api/search?q=&lectureId=`
- **Auth:** public. Searches `ready` + `public` sessions; with `lectureId`, that one session (unlisted allowed — you have the link)
- **Validation:** `q` 2–200 chars
- **Response:** `{ "results": [{ lectureId, title, speaker, startS, endS, snippetHtml, chapterTitle }] }` — `snippetHtml` from `ts_headline` with only `<b>` tags, everything else escaped
- **Errors:** `400`

### `POST /api/ask`
- **Auth:** public, **rate-limited:** 20/hour per IP-hash, 500/day global → `429` with `Retry-After`
- **Request:** `{ "question": string(3–300), "lectureId"?: uuid }`
- **Response:**
  ```json
  {
    "status": "answered" | "not_found" | "fallback",
    "answer": "Overfitting is when … [1] … [2]",
    "citations": [{ "n": 1, "segmentId": 812, "lectureId": "…", "title": "…", "speaker": "…",
                    "startS": 754.2, "endS": 764.9, "text": "…", "momentUrl": "https://res.cloudinary.com/…" }]
  }
  ```
  `not_found`: no retrieved segments, or Claude cited nothing valid → `answer` is a fixed "not covered in this library" message. `fallback`: Claude errored/timed out → `answer` is null, `citations` are the top retrieved segments (Find results as clips — NFR4).
- **Errors:** `400` · `429`

---

Every endpoint maps to an FR in `PRD.md`; there is no endpoint without one.
