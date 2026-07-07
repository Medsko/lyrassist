


## Timer
For Tweedy's suggestion to force yourself to write (as much as possible of) a song in 20 min. Should keep working across
all different modes - so one timer app-wide that runs out. A clear visual (upper right corner) and maybe some cool
animation(s) upon timeout?




## Object Writing 
the canonical one, from Pat Pattison's Writing Better Lyrics. You get one random noun and write about it for exactly 10 minutes, but only through the senses — sight,
sound, smell, taste, touch, plus body sensation and motion. The discipline is the timer and the sensory constraint; it trains the "show, don't tell" muscle that lyrics live on. App-wise
it's small: random noun (you have 9,615), a countdown timer, a text area, and the seven senses as gentle prompts. Crucially, saving the result forces the first differently-shaped idea
table (a text column, not word references) — exactly the design fork you anticipated with spark.

## Rhyme explorer
given a word, show perfect rhymes but also family and near rhymes (Pattison again: "love/enough" is more interesting than "love/dove"). This needs pronunciation data —
the CMU Pronouncing Dictionary — which is the same dataset that fills your dormant syllable_count column. One import, two features.

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
