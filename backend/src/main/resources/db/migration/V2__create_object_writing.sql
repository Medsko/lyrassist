-- A completed object-writing exercise: sense-bound free writing about one noun.
CREATE TABLE object_writing (
    id               BIGSERIAL PRIMARY KEY,
    noun_id          BIGINT NOT NULL REFERENCES word (id),
    body             TEXT NOT NULL,
    duration_seconds INT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
