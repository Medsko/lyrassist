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

    private val WHITESPACE = Regex("\\s+")

    /**
     * Cuts [text] into fragments of [fragmentSize] words and returns them
     * shuffled. About a quarter of the fragments get a ±1 jitter (at least one
     * word; size 1 stays exact) so the cuts don't feel mechanical. Every call
     * cuts and shuffles anew — "cut again" is simply another call.
     */
    fun cutUp(text: String, fragmentSize: Int, random: Random = Random): List<String> {
        val words = text.split(WHITESPACE).filter { it.isNotBlank() }
        val fragments = mutableListOf<String>()
        var index = 0
        while (index < words.size) {
            val jitter = if (fragmentSize == 1 || random.nextInt(4) != 0) 0
                         else if (random.nextBoolean()) 1 else -1
            val size = (fragmentSize + jitter).coerceAtLeast(1)
            fragments += words.subList(index, minOf(index + size, words.size)).joinToString(" ")
            index += size
        }
        return fragments.shuffled(random)
    }

}
