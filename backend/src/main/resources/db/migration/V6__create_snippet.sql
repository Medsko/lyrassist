-- A snippet: reusable free text at any granularity — a line, a verse, a whole
-- song. Written in the notepad now; later modes (cut-up, ...) mine them.
CREATE TABLE snippet (
    id         BIGSERIAL PRIMARY KEY,
    title      VARCHAR(200) NOT NULL DEFAULT '',
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
