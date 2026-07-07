# Lyrassist

claude --resume 0530708d-85e9-4d99-94b0-2eab634bbff9


A web app that assists a human lyricist — it doesn't write songs, it sparks them.
Lyrassist generates word-pair prompts, lets you save the ones you like, and will later
help you combine saved ideas into snippets, lines, and eventually songs.

## Modes

The home screen offers a grid of assist modes. Currently available:

- **Word Sparks** — generates a chosen number (1–20) of adjective + noun pairs as
  inspiration prompts. Save the pairs that spark something.

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

## Dictionary

The word lists are built by `scripts/build-dictionary.py` from WordNet 3.1 index files,
dropping multi-word entries, named entities (WordNet "instance" synsets: people, places,
organizations), and anything outside the top 20,000 words of
[Norvig's frequency list](https://norvig.com/ngrams/count_1w.txt). Rerun the script and
truncate the `word` table (cascades to `spark`) to reseed after changing the filters.
