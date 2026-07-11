package nl.medsko.lyrassist.rhyme

/**
 * Pat Pattison's rhyme spectrum, from most to least stable. Each candidate word
 * lands in at most one type, the most stable one that applies.
 */
enum class RhymeType {
    /** Identical sounds from the last stressed vowel on: love/dove. */
    PERFECT,

    /** Final consonants swapped within their phonetic family: love/enough. */
    FAMILY,

    /** The candidate adds ending consonants: love/loved. */
    ADDITIVE,

    /** The candidate drops ending consonants: loved/love. */
    SUBTRACTIVE,

    /** Same vowel, unrelated ending consonants: love/cut. */
    ASSONANCE,

    /** Same ending consonants, different vowel: love/leave. */
    CONSONANCE,
}

/**
 * Classifies pairs of CMU/ARPAbet pronunciations (space-separated phonemes,
 * vowels carrying stress digits, e.g. "L AH1 V") into [RhymeType]s.
 */
object RhymeClassifier {

    private val VOWELS = setOf(
        "AA", "AE", "AH", "AO", "AW", "AY", "EH", "ER", "EY", "IH", "IY", "OW", "OY", "UH", "UW",
    )

    // Pattison's consonant families: substituting within one keeps the rhyme's character.
    private val FAMILIES = listOf(
        setOf("P", "B", "T", "D", "K", "G"), // plosives
        setOf("F", "V", "TH", "DH", "S", "Z", "SH", "ZH", "CH", "JH"), // fricatives and affricates
        setOf("M", "N", "NG"), // nasals
    )

    fun classify(targetPronunciation: String, candidatePronunciation: String): RhymeType? {
        val target = tail(targetPronunciation)
        val candidate = tail(candidatePronunciation)
        if (target.isEmpty() || candidate.isEmpty()) return null
        // Identical throughout is an identity (bare/bear), not a rhyme.
        if (strip(targetPronunciation) == strip(candidatePronunciation)) return null
        return when {
            target == candidate -> RhymeType.PERFECT
            isConsonantExtension(target, candidate) -> RhymeType.ADDITIVE
            isConsonantExtension(candidate, target) -> RhymeType.SUBTRACTIVE
            isFamily(target, candidate) -> RhymeType.FAMILY
            vowelsOf(target) == vowelsOf(candidate) -> RhymeType.ASSONANCE
            isConsonance(target, candidate) -> RhymeType.CONSONANCE
            else -> null
        }
    }

    /**
     * The rhyming part: phonemes from the last stressed vowel (primary or
     * secondary, so butterfly rhymes on "fly") on, stress digits removed.
     */
    fun tail(pronunciation: String): List<String> {
        val phonemes = strip(pronunciation)
        val stresses = pronunciation.split(" ").map { it.last() }
        val start = stresses.indexOfLast { it == '1' || it == '2' }
            .takeIf { it >= 0 }
            ?: phonemes.indexOfLast { it in VOWELS }
        return if (start < 0) emptyList() else phonemes.drop(start)
    }

    private fun strip(pronunciation: String): List<String> =
        pronunciation.split(" ").map { it.trimEnd { c -> c.isDigit() } }

    /** True when [longer] is [shorter] plus extra ending consonants (no new syllable). */
    private fun isConsonantExtension(shorter: List<String>, longer: List<String>): Boolean =
        longer.size > shorter.size &&
            longer.subList(0, shorter.size) == shorter &&
            longer.drop(shorter.size).none { it in VOWELS }

    private fun isFamily(target: List<String>, candidate: List<String>): Boolean {
        if (target.size != candidate.size) return false
        var swapped = false
        for ((a, b) in target.zip(candidate)) {
            when {
                a == b -> {}
                a in VOWELS || b in VOWELS -> return false
                FAMILIES.any { a in it && b in it } -> swapped = true
                else -> return false
            }
        }
        return swapped
    }

    private fun isConsonance(target: List<String>, candidate: List<String>): Boolean =
        target.size > 1 && // an open syllable shares no consonants: free/law is nothing
            target.size == candidate.size &&
            target.zip(candidate).all { (a, b) -> if (a in VOWELS) b in VOWELS else a == b }

    private fun vowelsOf(tail: List<String>): List<String> = tail.filter { it in VOWELS }
}
