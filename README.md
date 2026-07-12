# Lyrassist

A web app that assists a human lyricist — it doesn't write songs, it sparks them.
Lyrassist generates word-pair prompts, lets you save the ones you like, and will later
help you combine saved ideas into snippets, lines, and eventually songs.

## Modes

The home screen offers a grid of assist modes. Currently available:

- **Word Sparks** — generates a chosen number (1–20) of adjective + noun pairs as
  inspiration prompts. Save the pairs that spark something. Its Metaphor collision
  variant deals noun + noun equations instead ("memory is a landlord") for you to
  argue into a song.
- **Object Writing** — Pat Pattison's exercise: one random noun, a countdown, and you
  write about it through the seven senses (sight, sound, smell, taste, touch, body,
  motion). Pieces are saved for later mining.
- **Rhyme Explorer** — given a word, shows rhymes across Pattison's spectrum: perfect,
  family, additive, subtractive, assonance, and consonance (because "love/enough" is
  more interesting than "love/dove"). Click any result to explore from there.
- **Story Seeds** — deals a who / where / conflict prompt for narrative songs
  ("a locksmith / at a wedding / who owes someone an apology"). The who is a person
  noun from the dictionary; where and conflict come from curated lists.
- **Cut-up** — cuts up a text into fragments of a specified number of words, which
  the user can rearrange create something new (credits to William S. Burroughs). Such
  Seed texts can be saved to and queried from the database.

There is also an app-wide timer in the navbar (for e.g. Jeff Tweedy's write-a-song-in-20-
minutes exercise); it keeps counting across modes, and Object Writing drives it too.
See `roadmap.md` for planned modes.

An app-wide Notepad is available for the user to jot down ideas in, be it some lines,
a verse, or an entire song. These can be saved to the database (as Snippet entity).

## Stack

- **Backend**: Kotlin, Spring Boot 4, Gradle — `backend/`
- **Frontend**: React, TypeScript, Vite, React-Bootstrap — `frontend/`
- **Database**: PostgreSQL 17 (containerized), Flyway migrations, seeded with the
  English dictionary from WordNet 3.1 (adjectives + nouns, filtered to single words)

## Running locally

Prerequisites: Java (Gradle auto-provisions a JDK 21 toolchain), Node 22+, and Podman
(or Docker) for PostgreSQL.

1. **Database** — first time: `podman compose up -d` (or `docker compose up -d`) to create
   and start the container. After that, `podman start lyrassist-postgres` (or
   `podman compose start`) brings it back up.

2. **Backend** — `cd backend && ./gradlew bootRun`. On first start Flyway creates the
   schema and the seeder loads ~15k words (5,320 adjectives, 9,615 nouns) from the
   bundled WordNet-derived CSVs; subsequent starts skip seeding.

3. **Frontend** — `cd frontend && npm install && npm run dev`, then open
   <http://localhost:5173>. The dev server proxies `/api` to the backend on port 8080.

Note: `./gradlew build` runs a Spring context test that expects the database container
to be running.

## API

| Base path | Controller | Behavior |
|---|---|---|
| `/api/word-sparks` | `WordSparksController` | Generate word-pair prompts: `GET /pairs?count=N` (adjective + noun) and `GET /metaphors?count=N` (noun + noun), N is 1–20 |
| `/api/sparks` | `SparkController` | CRUD for saved word-spark pairs |
| `/api/metaphors` | `MetaphorController` | CRUD for saved metaphor pairs |
| `/api/rhymes` | `RhymeController` | `GET ?word=W` — W's rhymes grouped by Pattison type (404 if no pronunciation known) |
| `/api/story-seeds` | `StorySeedController` | `GET /prompt` for a random who / where / conflict prompt, plus CRUD for saved seeds |
| `/api/object-writing` | `ObjectWritingController` | `GET /prompt` for a random concrete noun, plus CRUD for saved pieces under `/pieces` |
| `/api/snippets` | `SnippetController` | CRUD for snippets — reusable free text at any granularity (a line, a verse, a song), written in the notepad |
| `/api/cut-up` | `CutUpController` | `POST /fragments` — cut pasted text and/or snippets into shuffled word fragments (each call recuts) |

## Dictionary

The word lists are built by the `buildDictionary` Gradle task (`backend/src/main/kotlin/
nl/medsko/lyrassist/tools/BuildDictionary.kt`) from WordNet 3.1 index files,
dropping multi-word entries, named entities (WordNet "instance" synsets: people, places,
organizations), and anything outside the top 20,000 words of
[Norvig's frequency list](https://norvig.com/ngrams/count_1w.txt). Each word is annotated
with its ARPAbet pronunciation and syllable count from the
[CMU Pronouncing Dictionary](https://github.com/cmusphinx/cmudict) (~79% coverage; words
without a pronunciation don't appear in rhyme results). Nouns also carry the WordNet
lexicographer category of their most common sense (noun.person, noun.artifact, ...),
which drives Story Seeds' who-column and keeps Object Writing prompts concrete; senses
WordNet marks offensive get no category, so prompt features never deal them. To reseed after changing the
filters, rerun the task (inputs are linked in its KDoc):

```sh
cd backend && ./gradlew buildDictionary \
  -PwordnetDir=<wordnet-dict-dir> -Pcount1w=<count_1w.txt> -Pcmudict=<cmudict.dict>
```

then truncate the `word` table (cascades to `spark`) and restart the backend. Databases seeded
before pronunciations existed are backfilled in place on startup — no truncate needed,
saved sparks and pieces survive.
