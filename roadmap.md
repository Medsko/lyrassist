
# Bugs/tiny issues

## Cut-up mode issues

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

