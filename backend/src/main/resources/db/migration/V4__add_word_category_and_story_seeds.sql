-- WordNet lexicographer category of the noun's most common sense (noun.person,
-- noun.location, ...). NULL for adjectives and for senses WordNet marks offensive.
ALTER TABLE word ADD COLUMN category TEXT;

CREATE INDEX idx_word_category ON word (category);

-- A saved Story Seeds prompt: who (a person noun) / where / conflict.
-- The where and conflict come from curated lists bundled with the app, so they
-- are stored as text, not word references.
CREATE TABLE story_seed (
    id          BIGSERIAL PRIMARY KEY,
    who_id      BIGINT NOT NULL REFERENCES word (id),
    where_text  TEXT NOT NULL,
    conflict    TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
