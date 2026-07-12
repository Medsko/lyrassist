package nl.medsko.lyrassist.cutup

import kotlin.random.Random

/**
 * Burroughs/Bowie cut-up: shred prose into short word fragments and shuffle
 * them, so the writer can mine the collisions for lines.
 *
 * (A cut-upper by trade; the name lands the knockout blow on the source text.)
 */
object UpperCut {

    /**
     * Cuts [text] into fragments of roughly [fragmentSize] words (± 1, at least
     * one word; size 1 stays exact) and returns them shuffled. Every call cuts
     * and shuffles anew — "cut again" is simply another call.
     */
    fun cutUp(text: String, fragmentSize: Int, random: Random = Random): List<String> {
        val words = text.split(WHITESPACE).filter { it.isNotBlank() }
        val fragments = mutableListOf<String>()
        var index = 0
        while (index < words.size) {
            val jitter = if (fragmentSize == 1) 0 else random.nextInt(-1, 2)
            val size = (fragmentSize + jitter).coerceAtLeast(1)
            fragments += words.subList(index, minOf(index + size, words.size)).joinToString(" ")
            index += size
        }
        return fragments.shuffled(random)
    }

    private val WHITESPACE = Regex("\\s+")
}
