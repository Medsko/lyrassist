
# Bugs/tiny issues
Cards on the home screen: 4 columns > 3 columns. No 'Coming soon' placeholders.

One known edge: a full page reload mid-exercise ends the session early (the timer lives in React state; the draft survives, but the countdown doesn't). Fixing it means persisting the
timer's end-time to sessionStorage too — small job, happy to do it if reload-during-writing matters to you.


# Features

## Notebook — done
Shipped as the Notepad: a collapsible side panel (offcanvas sheet below lg) that
follows the lyricist across modes. Title + plain-text draft, explicit Save button
(also Ctrl+S), dirty indicator. Title is not required to save — jotting should
stay frictionless. The context already exposes `append()` so modes can send
sparks into the pad later.

Second iteration: Save persists to the backend as a *snippet* (`snippet` table,
`/api/snippets`) — reusable free text at any granularity: a line, a verse, a
whole song. The panel got twice as wide plus New/Open controls (load, delete)
over the saved snippets; localStorage is now just the crash buffer, so every
keystroke survives a reload without needing Save.


## Rhyme explorer — done
Shipped as the Rhyme Explorer mode. The CMU Pronouncing Dictionary import also filled
the syllable_count column, which future features (meter work, line matching) can lean on.
Pronunciations are backfilled into existing databases on startup, and the dictionary
build script is now Kotlin (`./gradlew buildDictionary` in `backend/`).


## Metaphor collisions — done
Shipped as a variant toggle on the Word Sparks page: "Metaphor collision" deals
noun + noun equations ("memory is a landlord") with the same drag-to-swap and
save mechanics. Saved metaphors live in their own `metaphor` table
(tenor/vehicle, after I.A. Richards' terms for a metaphor's subject and image).

## Title sparks 
generate title-shaped fragments from small templates ("The [noun] of [noun]", "[adjective] [noun] Blues"). Cheap, fun, and starts producing multi-word output — a first step
toward snippets.

## Story seeds — done
Shipped as the Story Seeds mode: who (random noun.person from the dictionary) /
where / conflict (curated lists in `backend/src/main/resources/story-seeds/`).
The lexicographer-category work landed with it: `word.category` holds each noun's
WordNet category, offensive senses excluded at build time.

## Cut-up mode
Bowie/Burroughs style: paste in a text, get it back shuffled into fragments to mine for lines. The snippet concept it needs now exists (`/api/snippets`) — it can draw on saved snippets as source material as well as pasted text.
