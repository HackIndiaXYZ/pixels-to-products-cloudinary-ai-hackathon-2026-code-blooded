-- Study Packs (Phase 13) and Learner Insights (Phase 14).

CREATE TABLE study_packs (
    lecture_id UUID PRIMARY KEY REFERENCES lectures(id) ON DELETE CASCADE,
    pack       JSONB NOT NULL,
    model      TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- What learners ask. Question text only: no IP, no identity (the rate-limit table stays separate and hashed).
CREATE TABLE ask_log (
    id          BIGSERIAL PRIMARY KEY,
    question    TEXT NOT NULL CHECK (length(question) <= 300),
    status      TEXT NOT NULL CHECK (status IN ('answered', 'not_found', 'fallback')),
    lecture_ids UUID[] NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ask_log_recent ON ask_log (created_at DESC);

-- Which moments travel.
CREATE TABLE moment_events (
    id         BIGSERIAL PRIMARY KEY,
    segment_id BIGINT NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
    kind       TEXT NOT NULL CHECK (kind IN ('open', 'share')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_moment_events_recent ON moment_events (created_at DESC, segment_id);
