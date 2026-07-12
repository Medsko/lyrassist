-- A seed: a source text for cut-up — a poem, lyrics, prose. Saved so a good
-- text to shred can be reused across sessions.
CREATE TABLE seed (
    id         BIGSERIAL PRIMARY KEY,
    title      VARCHAR(200) NOT NULL DEFAULT '',
    source VARCHAR(200) NOT NULL DEFAULT '',
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
