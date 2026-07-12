package nl.medsko.lyrassist.cutup

import kotlin.random.Random
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class UpperCutTest {

    private val text = """
        Time may change me
        But I can't trace time
        I watched the ripples change their size
    """.trimIndent()

    private val words = text.split(Regex("\\s+"))

    @Test
    fun `every word survives the cut`() {
        repeat(20) { seed ->
            val fragments = UpperCut.cutUp(text, fragmentSize = 3, random = Random(seed))
            val fragmentWords = fragments.flatMap { it.split(" ") }
            assertEquals(words.sorted(), fragmentWords.sorted())
        }
    }

    @Test
    fun `fragment sizes stay within one word of the requested size, short leftover tail aside`() {
        repeat(20) { seed ->
            val fragments = UpperCut.cutUp(text, fragmentSize = 3, random = Random(seed))
            val sizes = fragments.map { it.split(" ").size }
            assertTrue(sizes.max() <= 4, "oversized fragment among $sizes")
            assertTrue(sizes.count { it < 2 } <= 1, "more than one undersized fragment among $sizes")
        }
    }

    @Test
    fun `fragment size one yields single words`() {
        val fragments = UpperCut.cutUp(text, fragmentSize = 1, random = Random(1))
        assertTrue(fragments.all { !it.contains(" ") })
        assertEquals(words.size, fragments.size)
    }

    @Test
    fun `blank text yields no fragments`() {
        assertEquals(emptyList(), UpperCut.cutUp("", fragmentSize = 3))
        assertEquals(emptyList(), UpperCut.cutUp("  \n\t ", fragmentSize = 3))
    }

    @Test
    fun `whitespace runs and newlines collapse into single separators`() {
        val fragments = UpperCut.cutUp("one \n  two\t\tthree", fragmentSize = 6, random = Random(1))
        assertEquals(listOf("one two three"), fragments)
    }

    @Test
    fun `cutting again reshuffles`() {
        // With enough fragments, two differently seeded cuts virtually never agree.
        val first = UpperCut.cutUp(text, fragmentSize = 2, random = Random(1))
        val second = UpperCut.cutUp(text, fragmentSize = 2, random = Random(2))
        assertTrue(first != second)
    }
}
