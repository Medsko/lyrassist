CREATE TABLE word (
    id             BIGSERIAL PRIMARY KEY,
    lemma          TEXT NOT NULL,
    part_of_speech TEXT NOT NULL,
    syllable_count INT,
    UNIQUE (lemma, part_of_speech)
);

CREATE INDEX idx_word_part_of_speech ON word (part_of_speech);

-- A saved Word Sparks pair. Future modes producing differently-shaped ideas
-- (e.g. a whole verse in a text column) get their own tables.
CREATE TABLE spark (
    id           BIGSERIAL PRIMARY KEY,
    adjective_id BIGINT NOT NULL REFERENCES word (id),
    noun_id      BIGINT NOT NULL REFERENCES word (id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (adjective_id, noun_id)
);
