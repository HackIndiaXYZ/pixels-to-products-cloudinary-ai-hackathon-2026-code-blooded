# System Architecture — Pravaha

Read `PRD.md`, `CLOUDINARY.md` and `TRD.md` first; these diagrams show those decisions in motion.

## 1. System Context

```mermaid
flowchart TB
    Organizer["Organizer<br/>(Studio)"]
    Learner["Learner<br/>(phone / laptop)"]
    Pravaha(["Pravaha<br/>Next.js on Vercel"])
    Cloudinary["Cloudinary<br/>ingest · transcription · chaptering<br/>player · transformations · CDN"]
    Claude["Claude<br/>grounded answers"]
    DB[("Neon Postgres<br/>sessions · segments")]

    Organizer -->|passcode, upload| Pravaha
    Learner -->|watch, find, ask, share| Pravaha
    Organizer -.->|video bytes, signed| Cloudinary
    Learner -.->|HLS, clips, thumbnails| Cloudinary
    Cloudinary -->|webhook| Pravaha
    Pravaha --> DB
    Pravaha -->|question + retrieved segments| Claude
```

Media never passes through Pravaha. Cloudinary is the media plane; Pravaha is the knowledge plane.

## 2. Components

```mermaid
flowchart TB
    subgraph Client["Browser"]
        Home["/ · Ask bar + Library"]
        Search["/search · Answer + Moments found"]
        Watch["/watch/id · CldVideoPlayer"]
        Studio["/studio · CldUploadWidget"]
    end

    subgraph API["Vercel route handlers"]
        Sess["/api/organizer/session"]
        Sign["/api/upload-signature"]
        Hook["/api/webhooks/cloudinary"]
        Lect["/api/lectures"]
        Find["/api/search"]
        Ask["/api/ask"]
    end

    subgraph Lib["src/lib (pure logic, unit-tested)"]
        Seg["segments.ts"]
        Cit["citations.ts"]
        Med["media.ts (momentUrl)"]
        Auth["auth.ts"]
    end

    Studio --> Sess & Sign & Lect
    Home --> Lect
    Search --> Find & Ask
    Hook --> Seg
    Ask --> Cit & Med
    Sign --> Auth
```

## 3. Ingest — Upload to Ready

```mermaid
sequenceDiagram
    participant S as Studio
    participant A as Pravaha API
    participant D as Postgres
    participant C as Cloudinary

    S->>A: POST /api/upload-signature {title, speaker, rightsConfirmed}
    A->>D: INSERT lecture (processing, unlisted)
    A-->>S: signed params (public_id, auto_transcription, auto_chaptering, notification_url)
    S->>C: Upload video directly (Upload Widget, real progress)
    C->>C: Transcribe + chapter (async)
    C->>A: Webhook {info_kind: auto_transcription, complete}
    A->>A: Verify signature (raw body + timestamp)
    A->>C: GET {public_id}.transcript (+ chapters)
    A->>A: buildSegments() ~10 s windows
    A->>D: TX: replace segments, status = ready
    S->>A: poll GET /api/lectures/:id → ready
```

Failure branch: `info_status: failed` → `transcript_failed`; the video still plays (NFR4).

## 4. Find

```mermaid
flowchart LR
    Q["q = 'gradient descent'"] --> V["Zod: 2–200 chars"]
    V --> F[("segments ⋈ lectures<br/>public + ready<br/>websearch_to_tsquery<br/>ts_rank_cd · ts_headline")]
    F --> R["Results: session · speaker · t · snippet"]
    R --> W["/watch/id?t=754"]
```

No AI, no Cloudinary API call — milliseconds.

## 5. Ask — the core flow

```mermaid
flowchart TD
    Q["Question"] --> RL{"Rate limit OK?<br/>(ask_requests)"}
    RL -- No --> E429["429 + Retry-After"]
    RL -- Yes --> RET["Retrieve: OR-ed tsquery, top 12,<br/>± neighbour segments"]
    RET --> NONE{"Any segments?"}
    NONE -- No --> NF["not_found<br/>(no Claude call)"]
    NONE -- Yes --> CL["Claude: answer + cited_segment_ids<br/>(structured, 15 s timeout)"]
    CL -- error/timeout --> FB["fallback: top 4 segments as clips"]
    CL --> VAL["validateAnswer():<br/>drop IDs not retrieved · strip markers · renumber"]
    VAL --> ZERO{"≥1 valid citation?"}
    ZERO -- No --> NF
    ZERO -- Yes --> OUT["answered: text + citations<br/>each with momentUrl"]
```

The model can only cite what retrieval returned, and anything else is deleted before the learner sees it.

## 6. Moments

```mermaid
flowchart LR
    SEG["Segment<br/>754.2 → 764.9 s"] --> MU["momentUrl()<br/>pad ±1.5 s · cap 60 s"]
    MU --> URL["res.cloudinary.com/…/so_752.7,eo_766.4/<br/>c_fill,ar_9:16,w_720,g_auto/<br/>l_subtitles:…transcript/fl_layer_apply/<br/>f_auto,q_auto/pravaha/id.mp4"]
    URL --> CDN["Cloudinary generates once,<br/>CDN-caches"]
    CDN --> SH["navigator.share → WhatsApp"]
```

## 7. Data

```mermaid
erDiagram
    lectures ||--o{ segments : has
    lectures {
        uuid id PK
        text public_id UK
        text title
        text speaker
        enum status
        enum visibility
        real duration_s
        timestamptz rights_confirmed_at
    }
    segments {
        bigserial id PK
        uuid lecture_id FK
        real start_s
        real end_s
        text text
        text chapter_title
        tsvector search_vector
    }
    ask_requests {
        bigserial id PK
        text ip_hash
        timestamptz created_at
    }
```

## 8. Organizer Auth

```mermaid
sequenceDiagram
    participant O as Organizer
    participant A as Pravaha API
    O->>A: POST /api/organizer/session {passcode}
    A->>A: timingSafeEqual(sha256(passcode), sha256(ORGANIZER_PASSCODE))
    A-->>O: Set-Cookie pravaha_org = expiry.HMAC(SESSION_SECRET) (HttpOnly, Secure, Lax)
    O->>A: POST /api/upload-signature (cookie)
    A->>A: verify HMAC + expiry → else 401
```

## 9. Deployment

```mermaid
flowchart LR
    Dev["feature/* branch"] -->|push| GH["GitHub"]
    GH --> CI["Actions: lint · typecheck · unit"]
    GH --> Prev["Vercel preview per PR"]
    CI & Prev --> PR["PR → squash merge"]
    PR --> Main["main"] --> Prod["Vercel production"]
    Prod --> Neon[("Neon")]
    Prod --> CLD["Cloudinary"]
    Prod --> ANT["Anthropic"]
```

Branching rules: `GIT_WORKFLOW.md`.
