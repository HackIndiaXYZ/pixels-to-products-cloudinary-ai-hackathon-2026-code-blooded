-- Pravaha schema v2 (docs/DATABASE.md). Apply once: Neon SQL editor or psql "$DATABASE_URL" -f migrations/001_init.sql

CREATE TYPE lecture_status     AS ENUM ('processing', 'ready', 'transcript_failed');
CREATE TYPE lecture_visibility AS ENUM ('unlisted', 'public');

CREATE TABLE lectures (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id           TEXT NOT NULL UNIQUE,
    title               TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 140),
    speaker             TEXT CHECK (length(speaker) <= 80),
    status              lecture_status     NOT NULL DEFAULT 'processing',
    visibility          lecture_visibility NOT NULL DEFAULT 'unlisted',
    duration_s          REAL,
    rights_confirmed_at TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE segments (
    id            BIGSERIAL PRIMARY KEY,
    lecture_id    UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
    start_s       REAL NOT NULL,
    end_s         REAL NOT NULL CHECK (end_s > start_s),
    text          TEXT NOT NULL,
    chapter_title TEXT,
    search_vector TSVECTOR GENERATED ALWAYS AS
        (to_tsvector('english', coalesce(chapter_title, '') || ' ' || text)) STORED
);

CREATE TABLE ask_requests (
    id         BIGSERIAL PRIMARY KEY,
    ip_hash    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_segments_search  ON segments USING GIN (search_vector);
CREATE INDEX idx_segments_lecture ON segments (lecture_id, start_s);
CREATE INDEX idx_lectures_public  ON lectures (created_at DESC) WHERE status = 'ready' AND visibility = 'public';
CREATE INDEX idx_ask_recent       ON ask_requests (created_at, ip_hash);
