package nl.medsko.lyrassist.cutup

import kotlin.random.Random

/**
 * Burroughs/Bowie cut-up: shred prose into short word fragments and shuffle
 * them, so the writer can mine the collisions for lines.
 *
 * My deepest apologies for the name, which I deoptimized for shits and
 * gigglesy purposes.
 */
object UpperCut {

    /** Hyphens, dashes and slashes split words; other punctuation is stripped. */
    private val SEPARATORS = Regex("[\\s\\-–—/]+")

    /** Everything that isn't a letter, digit or intra-word apostrophe. */
    private val NOISE = Regex("[^\\p{L}\\p{N}']")

    /**
     * Cuts [text] into fragments of [fragmentSize] words and returns them
     * shuffled. Words are sanitized on the way in (brackets, quotes and other
     * punctuation dropped; hyphens and dashes act as cuts) — the source text
     * itself is left untouched. Duplicate fragments are filtered out, and when
     * [maxFragments] is given at most that many fragments are returned — the
     * whole text is still cut first, so every part of it stands a chance.
     * About a quarter of the fragments get a ±1 jitter (at least one word;
     * size 1 stays exact) so the cuts don't feel mechanical. Every call cuts
     * and shuffles anew — "cut again" is simply another call.
     */
    fun cutUp(text: String, fragmentSize: Int, maxFragments: Int? = null, random: Random = Random): List<String> {
        val words = text.split(SEPARATORS).map { sanitize(it) }.filter { it.isNotBlank() }
        val fragments = mutableListOf<String>()
        var index = 0
        while (index < words.size) {
            val jitter = determineJitter(fragmentSize, random)
            val size = (fragmentSize + jitter).coerceAtLeast(1)
            fragments += words.subList(index, minOf(index + size, words.size)).joinToString(" ")
            index += size
        }
        val shuffled = fragments.shuffled(random).distinct()
        return if (maxFragments != null) shuffled.take(maxFragments) else shuffled
    }

    private fun sanitize(word: String): String = word.replace(NOISE, "").trim('\'')

    private fun determineJitter(fragmentSize: Int, random: Random): Int =
        if (fragmentSize == 1 || random.nextInt(4) != 0) 0
        else if (random.nextBoolean()) 1 else -1

}
