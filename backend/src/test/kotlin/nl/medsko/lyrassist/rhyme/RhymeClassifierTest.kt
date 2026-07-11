package nl.medsko.lyrassist.rhyme

import kotlin.test.Test
import kotlin.test.assertEquals

class RhymeClassifierTest {

    private fun classify(target: String, candidate: String) = RhymeClassifier.classify(target, candidate)

    @Test
    fun `perfect rhyme matches from the last stressed vowel`() {
        assertEquals(RhymeType.PERFECT, classify("L AH1 V", "D AH1 V")) // love/dove
        assertEquals(RhymeType.PERFECT, classify("L AH1 V", "G L AH1 V")) // love/glove
        assertEquals(RhymeType.PERFECT, classify("Y EH1 L OW0", "M EH1 L OW0")) // yellow/mellow
    }

    @Test
    fun `identical pronunciations are identities, not rhymes`() {
        assertEquals(null, classify("L AH1 V", "L AH1 V"))
        assertEquals(null, classify("B EH1 R", "B EH1 R")) // bare/bear
    }

    @Test
    fun `family rhyme swaps ending consonants within their family`() {
        assertEquals(RhymeType.FAMILY, classify("L AH1 V", "IH0 N AH1 F")) // love/enough: V-F fricatives
        assertEquals(RhymeType.FAMILY, classify("K AE1 T", "S T AE1 K")) // cat/stack: T-K plosives
        assertEquals(RhymeType.FAMILY, classify("R AH1 N", "S AH1 M")) // run/some: N-M nasals
    }

    @Test
    fun `additive and subtractive rhymes extend or drop ending consonants`() {
        assertEquals(RhymeType.ADDITIVE, classify("L AH1 V", "L AH1 V D")) // love/loved
        assertEquals(RhymeType.SUBTRACTIVE, classify("L AH1 V D", "L AH1 V")) // loved/love
        assertEquals(RhymeType.ADDITIVE, classify("F R IY1", "F R IY1 Z")) // free/freeze
    }

    @Test
    fun `an added syllable is not an additive rhyme`() {
        // love/loveless: the extension carries a vowel
        assertEquals(null, classify("L AH1 V", "L AH1 V L AH0 S"))
    }

    @Test
    fun `assonance keeps the vowel with unrelated consonants`() {
        assertEquals(RhymeType.ASSONANCE, classify("L AH1 V", "K AH1 T")) // love/cut: V-T cross-family
        assertEquals(RhymeType.ASSONANCE, classify("L AH1 V", "D R AH1 M Z")) // love/drums
    }

    @Test
    fun `consonance keeps the consonants with a different vowel`() {
        assertEquals(RhymeType.CONSONANCE, classify("L AH1 V", "L IY1 V")) // love/leave
    }

    @Test
    fun `open syllables share no consonants so a different vowel is nothing`() {
        assertEquals(null, classify("F R IY1", "L AO1")) // free/law
    }

    @Test
    fun `tail anchors on the last stressed vowel, secondary stress included`() {
        // butterfly: B AH1 T ER0 F L AY2 rhymes on "fly", not on "but"
        assertEquals(RhymeType.PERFECT, classify("B AH1 T ER0 F L AY2", "S K AY1")) // butterfly/sky
        assertEquals(RhymeType.ADDITIVE, classify("B AH1 T ER0 F L AY2", "K AY1 T")) // butterfly/kite
    }

    @Test
    fun `tail spans multiple syllables when stress comes early`() {
        assertEquals(RhymeType.PERFECT, classify("HH AA1 L OW0", "F AA1 L OW0")) // hollow/follow
        assertEquals(RhymeType.CONSONANCE, classify("Y EH1 L OW0", "HH AA1 L OW0")) // yellow/hollow
    }
}
