
# Bugs/tiny issues
Cards on the home screen: 4 columns > 3 columns. No 'Coming soon' placeholders.

One known edge: a full page reload mid-exercise ends the session early (the timer lives in React state; the draft survives, but the countdown doesn't). Fixing it means persisting the
timer's end-time to sessionStorage too — small job, happy to do it if reload-during-writing matters to you.

The prompt endpoint occasionally deals an abstract noun ("perfection"); Pattison prefers concrete objects. Once the synset work lands, filtering prompts to physical-object categories
(noun.artifact, noun.object, noun.food…) would be a one-liner.


# Features

## Rhyme explorer — done
Shipped as the Rhyme Explorer mode. The CMU Pronouncing Dictionary import also filled
the syllable_count column, which future features (meter work, line matching) can lean on.
Pronunciations are backfilled into existing databases on startup, and the dictionary
build script is now Kotlin (`./gradlew buildDictionary` in `backend/`).


## Metaphor collisions "X is Y": two random nouns and you justify the equation ("memory is a landlord"). Zero new data; it's Word Sparks with different framing. Could even be a variant
button on the existing page rather than a new mode.

## Title sparks 
generate title-shaped fragments from small templates ("The [noun] of [noun]", "[adjective] [noun] Blues"). Cheap, fun, and starts producing multi-word output — a first step
toward snippets.

## Story seeds
a who/where/conflict prompt ("a locksmith / at a wedding / owes someone an apology") for narrative songs. Needs curated word lists by category — this is where the
synset/lexicographer-category work we discussed would start paying off.

## Cut-up mode
Bowie/Burroughs style: paste in a text, get it back shuffled into fragments to mine for lines. Needs the snippet concept, so it's a later one.
