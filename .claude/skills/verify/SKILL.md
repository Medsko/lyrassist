---
name: verify
description: Build, launch, and drive Lyrassist (Spring Boot API + React frontend) to verify changes end-to-end.
---

# Verifying Lyrassist

## Launch

1. Postgres (data survives restarts in the named volume):
   `podman start lyrassist-postgres` — or first time:
   `podman run -d --name lyrassist-postgres -e POSTGRES_DB=lyrassist -e POSTGRES_USER=lyrassist -e POSTGRES_PASSWORD=lyrassist -p 5432:5432 -v lyrassist-pgdata:/var/lib/postgresql/data docker.io/library/postgres:17`
   (`podman compose up -d` fails on this machine: no compose provider installed.)
2. Backend: `cd backend && ./gradlew bootRun` (background; ~5s to start).
   First run applies Flyway V1 and seeds ~15k words from bundled CSVs; later runs log
   "Dictionary already seeded". To force a reseed (e.g. after regenerating the CSVs with
   scripts/build-dictionary.py):
   `podman exec lyrassist-postgres psql -U lyrassist -d lyrassist -c 'TRUNCATE spark, word RESTART IDENTITY CASCADE'`
   then restart the backend.
3. Frontend: `cd frontend && npm run dev` (background) → http://localhost:5173,
   proxies `/api` to :8080.

## Drive

- API surface: `curl 'localhost:8080/api/word-sparks/pairs?count=5'`,
  POST/GET/DELETE `/api/sparks` (POST body `{"adjectiveId":N,"nounId":N}`).
  Expect 400 on count outside 1–20 or wrong part of speech, 409 on duplicate spark,
  404 on deleting a missing one.
- Browser surface: Playwright with Firefox (`npm i playwright && npx playwright install firefox`
  in a scratch dir; system Chromium is not installed). Key selectors: home tiles are `.card`,
  slider `#pair-count`, generate `button:has-text("Spark")`, generated rows
  `.col-lg-7 .list-group-item`, saved list `.col-lg-5 .list-group-item`.

## Gotchas

- `./gradlew build` runs a `@SpringBootTest` context test that needs the Postgres
  container up.
- Toolchain JDK 21 is auto-provisioned by foojay on first build (system has Java 25 only).
