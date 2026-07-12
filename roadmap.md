
# Bugs/tiny issues

## Cut-up mode issues
- Saving Seeds (term I came up with for "Text to shred") to database for later use. Including a search modal 
like the one for Snippets in the Notepad.

- Should we sanitize the fragments, i.e. remove brackets, hyphens etc.? Maybe keep them in the Seed, but 
remove them before returning them from the cut-up service?

- Human users could quickly get overloaded - max Seed length is currently 50000 words, using a fragment size
of 5 that could mean 10000 fragments...we should introduce an input for the maximum number of fragments - but 
only after creating all the fragments, because we want the whole Seed text to be considered. So cut up the 
entire Seed text and then randomly select the specified number of fragments from them.

- When using lyrics from another song as Seed, repetition is likely to occur. This is fine if it leads to 
different combinations, but completely duplicated fragments should be filtered out.
Filtering should occur after sanitizing, but before limiting the number of returned fragments.


# Features

## Metre visualizer
Annotate the Snippet text (in the Notepad or in a separate mode - discuss) with the metre. Use - for 
unaccented, v or / for accented (or something else that is more standard). We'll want to add some 
explanation for this notation, I think a tooltip will suffice.

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

## Story seeds — done
Shipped as the Story Seeds mode: who (random noun.person from the dictionary) /
where / conflict (curated lists in `backend/src/main/resources/story-seeds/`).
The lexicographer-category work landed with it: `word.category` holds each noun's
WordNet category, offensive senses excluded at build time.

## Cut-up mode — done
Shipped as the Cut-Up mode: paste text and/or tick saved snippets, set the
fragment size (1–6 words, ±1 jitter), and get shuffled fragments back. Clicking
a fragment appends it to the notepad — cut-up results aren't persisted on their
own; the notepad/snippets are the collection point. Cutting happens server-side
(`cutup/UpperCut.kt`, pure logic unit-tested without Spring), and "Cut again" is
simply a fresh request.

## Cut-up mode - Seed database
The ability to save 'seeds' - a poem or lyrics that can be used for cut-up. 

