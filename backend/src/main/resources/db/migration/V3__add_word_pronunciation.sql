-- ARPAbet phonemes with stress digits from the CMU Pronouncing Dictionary,
-- e.g. 'L AH1 V'. NULL for words cmudict doesn't cover.
ALTER TABLE word
    ADD COLUMN pronunciation TEXT;
