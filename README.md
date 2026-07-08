# Lyrassist

claude --resume 0530708d-85e9-4d99-94b0-2eab634bbff9


A web app that assists a human lyricist — it doesn't write songs, it sparks them.
Lyrassist generates word-pair prompts, lets you save the ones you like, and will later
help you combine saved ideas into snippets, lines, and eventually songs.

## Modes

The home screen offers a grid of assist modes. Currently available:

- **Word Sparks** — generates a chosen number (1–20) of adjective + noun pairs as
  inspiration prompts. Save the pairs that spark something.
- **Object Writing** — Pat Pattison's exercise: one random noun, a countdown, and you
  write about it through the seven senses (sight, sound, smell, taste, touch, body,
  motion). Pieces are saved for later mining.
- **Rhyme Explorer** — given a word, shows rhymes across Pattison's spectrum: perfect,
  family, additive, subtractive, assonance, and consonance (because "love/enough" is
  more interesting than "love/dove"). Click any result to explore from there.

There is also an app-wide timer in the navbar (for e.g. Jeff Tweedy's write-a-song-in-20-
minutes exercise); it keeps counting across modes, and Object Writing drives it too.
See `roadmap.md` for planned modes.

## Stack

- **Backend**: Kotlin, Spring Boot 4, Gradle — `backend/`
- **Frontend**: React, TypeScript, Vite, React-Bootstrap — `frontend/`
- **Database**: PostgreSQL 17 (containerized), Flyway migrations, seeded with the
  English dictionary from WordNet 3.1 (adjectives + nouns, filtered to single words)

## Running locally

Prerequisites: Java (Gradle auto-provisions a JDK 21 toolchain), Node 22+, and Podman
(or Docker) for PostgreSQL.

1. **Database** — with a compose provider: `podman compose up -d` (or `docker compose up -d`).
   Without one, plain podman works too:

   ```sh
   podman run -d --name lyrassist-postgres \
     -e POSTGRES_DB=lyrassist -e POSTGRES_USER=lyrassist -e POSTGRES_PASSWORD=lyrassist \
     -p 5432:5432 -v lyrassist-pgdata:/var/lib/postgresql/data \
     docker.io/library/postgres:17
   ```

2. **Backend** — `cd backend && ./gradlew bootRun`. On first start Flyway creates the
   schema and the seeder loads ~15k words (5,320 adjectives, 9,615 nouns) from the
   bundled WordNet-derived CSVs; subsequent starts skip seeding.

3. **Frontend** — `cd frontend && npm install && npm run dev`, then open
   <http://localhost:5173>. The dev server proxies `/api` to the backend on port 8080.

Note: `./gradlew build` runs a Spring context test that expects the database container
to be running.

## API

| Method & path | Behavior |
|---|---|
| `GET /api/word-sparks/pairs?count=N` | N (1–20) random adjective + noun pairs |
| `POST /api/sparks` `{adjectiveId, nounId}` | Save a pair (409 on duplicate) |
| `GET /api/sparks` | List saved sparks, newest first |
| `DELETE /api/sparks/{id}` | Remove a saved spark |
| `GET /api/rhymes?word=W` | W's rhymes grouped by type (404 if no pronunciation known) |
| `GET /api/object-writing/prompt` | One random noun to write about |
| `POST /api/object-writing/pieces` `{nounId, body, durationSeconds}` | Save a finished piece |
| `GET /api/object-writing/pieces` | List saved pieces, newest first |
| `DELETE /api/object-writing/pieces/{id}` | Remove a piece |

## Dictionary

The word lists are built by the `buildDictionary` Gradle task (`backend/src/main/kotlin/
nl/medsko/lyrassist/tools/BuildDictionary.kt`) from WordNet 3.1 index files,
dropping multi-word entries, named entities (WordNet "instance" synsets: people, places,
organizations), and anything outside the top 20,000 words of
[Norvig's frequency list](https://norvig.com/ngrams/count_1w.txt). Each word is annotated
with its ARPAbet pronunciation and syllable count from the
[CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict) (~79% coverage; words
without a pronunciation don't appear in rhyme results). To reseed after changing the
filters, rerun the task (inputs are linked in its KDoc):

```sh
cd backend && ./gradlew buildDictionary \
  -PwordnetDir=<wordnet-dict-dir> -Pcount1w=<count_1w.txt> -Pcmudict=<cmudict.dict>
```

then truncate the `word` table (cascades to `spark`) and restart the backend. Databases seeded
before pronunciations existed are backfilled in place on startup — no truncate needed,
saved sparks and pieces survive.
