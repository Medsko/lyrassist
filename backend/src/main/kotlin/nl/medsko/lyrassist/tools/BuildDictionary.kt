package nl.medsko.lyrassist.tools

import java.nio.file.Path
import kotlin.io.path.createDirectories
import kotlin.io.path.forEachLine
import kotlin.io.path.readLines
import kotlin.io.path.writeText
import kotlin.system.exitProcess

/**
 * Builds the seed dictionary CSVs from WordNet 3.1 and a word-frequency list.
 *
 * Filters applied:
 * - single words only (lowercase letters, internal hyphens allowed), length 3-16
 * - nouns: drop lemmas that only occur in WordNet "instance" synsets (named
 *   people, places, organizations - marked with an @i instance-hypernym pointer)
 * - both: drop words outside the top [FREQUENCY_CUTOFF] of the frequency list
 *   (each hyphen-separated part must be common)
 * - both: drop the curated [EXCLUDE] junk (Roman numerals, acronyms, brand names)
 *
 * Each word is annotated with its primary CMU Pronouncing Dictionary entry
 * (ARPAbet phonemes with stress digits) and syllable count (= vowel phonemes).
 * See [resolvePronunciation]: a lemma missing from cmudict falls back to an
 * American respelling (British spellings) and, for compounds, to its parts'
 * pronunciations concatenated; both fields stay empty only when even that fails.
 * Nouns also carry the
 * WordNet lexicographer category of their most common sense (noun.person,
 * noun.location, noun.event, ...); the category field is empty for adjectives,
 * and for senses whose gloss WordNet marks offensive/disparaging (ethnic slurs
 * live in noun.person) so prompt features never deal them.
 *
 * Inputs (download once):
 *   https://wordnetcode.princeton.edu/wn3.1.dict.tar.gz  (extract dict/)
 *   https://norvig.com/ngrams/count_1w.txt
 *   https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict
 *
 * Usage (from backend/):
 *   ./gradlew buildDictionary -PwordnetDir=<wordnet-dict-dir> -Pcount1w=<count_1w.txt> -Pcmudict=<cmudict.dict>
 * Writes: src/main/resources/dictionary/{adjectives,nouns}.csv
 *         (columns: lemma,pronunciation,syllable_count,category)
 */
private const val FREQUENCY_CUTOFF = 20_000
private val WORD_RE = Regex("[a-z]+(-[a-z]+)*")
private val WHITESPACE = Regex("\\s+")

/** WordNet noun lexicographer file numbers (wninput(5WN)); other numbers are adj/adv/verb files. */
private val NOUN_LEX_NAMES = mapOf(
    3 to "noun.Tops", 4 to "noun.act", 5 to "noun.animal", 6 to "noun.artifact",
    7 to "noun.attribute", 8 to "noun.body", 9 to "noun.cognition", 10 to "noun.communication",
    11 to "noun.event", 12 to "noun.feeling", 13 to "noun.food", 14 to "noun.group",
    15 to "noun.location", 16 to "noun.motive", 17 to "noun.object", 18 to "noun.person",
    19 to "noun.phenomenon", 20 to "noun.plant", 21 to "noun.possession", 22 to "noun.process",
    23 to "noun.quantity", 24 to "noun.relation", 25 to "noun.shape", 26 to "noun.state",
    27 to "noun.substance", 28 to "noun.time",
)

private fun loadRanks(count1w: Path): Map<String, Int> =
    count1w.readLines()
        .mapIndexed { index, line -> line.substringBefore("\t") to index + 1 }
        .toMap()

private class NounSynsets(
    /** Lemmas that appear exclusively in instance synsets (named entities). */
    val instanceOnly: Set<String>,
    /** Synset offset -> lexicographer category (e.g. "noun.person"). */
    val categoryByOffset: Map<String, String>,
)

private fun parseDataNoun(dataNoun: Path): NounSynsets {
    val instance = mutableSetOf<String>()
    val regular = mutableSetOf<String>()
    val categories = mutableMapOf<String, String>()
    val offensive = Regex("offensive|disparaging|derogatory", RegexOption.IGNORE_CASE)
    dataNoun.forEachLine { line ->
        if (line.startsWith("  ")) return@forEachLine // license header
        val fields = line.split(" ")
        if (!offensive.containsMatchIn(line.substringAfter(" | ", ""))) {
            NOUN_LEX_NAMES[fields[1].toInt()]?.let { categories[fields[0]] = it }
        }
        val wordCount = fields[3].toInt(16)
        val lemmas = (0 until wordCount).map { fields[4 + 2 * it].lowercase() }
        val pointerStart = 4 + 2 * wordCount
        val pointerCount = fields[pointerStart].toInt()
        val symbols = (0 until pointerCount).map { fields[pointerStart + 1 + 4 * it] }
        (if ("@i" in symbols) instance else regular).addAll(lemmas)
    }
    return NounSynsets(instance - regular, categories)
}

/** Lemma -> primary ARPAbet pronunciation; alternates like "word(2)" are skipped. */
private fun loadPronunciations(cmudict: Path): Map<String, String> {
    val pronunciations = mutableMapOf<String, String>()
    cmudict.forEachLine { line ->
        val entry = line.substringBefore("#").trim()
        if (entry.isEmpty()) return@forEachLine
        val lemma = entry.substringBefore(" ")
        if ("(" !in lemma) pronunciations.putIfAbsent(lemma, entry.substringAfter(" "))
    }
    return pronunciations
}

/**
 * British -> American suffix rewrites, longest first. cmudict is American, so we
 * spell a British lemma the American way to borrow its pronunciation (the sound is
 * the same); the lemma itself stays British in the CSV.
 */
private val BRITISH_SUFFIXES = listOf(
    "isational" to "izational", "isation" to "ization",
    "ising" to "izing", "iser" to "izer", "ised" to "ized", "ise" to "ize",
    "ourable" to "orable", "ouring" to "oring", "oured" to "ored",
    "oural" to "oral", "ours" to "ors", "our" to "or",
    "ellor" to "elor", "elling" to "eling", "elled" to "eled",
    "olment" to "ollment", "ence" to "ense", "tre" to "ter", "yse" to "yze",
)

/** Irregular British spellings the suffix rules don't reach. */
private val WHOLE_WORD_ALIASES = mapOf(
    "ageing" to "aging", "jewellery" to "jewelry", "maths" to "math",
    "councillor" to "councilor", "centred" to "centered",
    "co-ordinator" to "coordinator", "transexual" to "transsexual",
)

/** American-spelling candidates to try in cmudict for a lemma missing from it. */
private fun usCandidates(word: String): List<String> = buildList {
    WHOLE_WORD_ALIASES[word]?.let { add(it) }
    for ((british, american) in BRITISH_SUFFIXES) {
        if (word.endsWith(british)) add(word.dropLast(british.length) + american)
    }
}

/**
 * Resolves a lemma's ARPAbet pronunciation: a direct cmudict hit, else an
 * American respelling, else - for a hyphenated compound - the parts' pronunciations
 * concatenated (rhyme keys off the last stressed vowel, so the final part still
 * carries the rhyme). Null when a part cannot be resolved.
 */
private fun resolvePronunciation(lemma: String, cmudict: Map<String, String>): String? {
    fun lookup(word: String): String? =
        cmudict[word] ?: usCandidates(word).firstNotNullOfOrNull { cmudict[it] }
    lookup(lemma)?.let { return it }
    if ("-" !in lemma) return null
    return lemma.split("-").map { part -> lookup(part) ?: return null }.joinToString(" ")
}

/**
 * Lemmas dropped entirely: cmudict has no pronunciation (so they can never rhyme)
 * and they are not words a lyricist would want sparked - Roman numerals,
 * initialisms/acronyms, unit abbreviations, and brand/drug/genus names. Genuine but
 * unpronounced words (beanie, checksum, sudoku, ...) are kept; they still serve the
 * non-rhyme modes.
 */
private val EXCLUDE = setOf(
    // Roman numerals
    "iii", "vii", "viii", "xii", "xiii", "xiv", "xvi", "xxx",
    // Initialisms, acronyms, unit and calendar abbreviations
    "adp", "afp", "ans", "apr", "asin", "bbs", "bmi", "bpm", "bse", "ccc", "cdna",
    "cli", "cns", "cpa", "cpi", "cpr", "crt", "cst", "dba", "dds", "dit", "dod",
    "dsl", "dts", "ecc", "ect", "eds", "esp", "esq", "faa", "faq", "fas", "fha",
    "fps", "fri", "fsb", "ftc", "ft-l", "gcse", "ghz", "gmt", "gop", "gpa", "gpo",
    "gsa", "gui", "hdtv", "hhs", "icc", "iis", "imf", "inst", "ipo", "khz", "kw-hr",
    "lcd", "mem", "mhz", "mls", "mot", "mps", "mrna", "msc", "msg", "mst", "mus",
    "mvp", "nih", "nrc", "nsa", "nsf", "nsu", "nsw", "omb", "otc", "pbs", "pct",
    "pda", "pfc", "phs", "pid", "pms", "ppp", "psa", "pst", "rbi", "sgml", "sion",
    "sle", "snp", "spf", "ssa", "std", "stp", "tcp", "thb", "tnt", "tues", "utc",
    "usps", "vcr", "vhf", "wac", "wlan", "wmd", "wto", "www", "xtc",
    // Brand, drug and genus names
    "alprazolam", "arabidopsis", "ativan", "burberry", "celebrex", "diazepam",
    "drosophila", "escherichia", "fortran", "levitra", "lipitor", "medline",
    "paxil", "vioxx", "xmas",
)

/** Lemma -> offset of its most common synset (index files list offsets by sense frequency). */
private fun loadIndexLemmas(indexFile: Path): Map<String, String> =
    indexFile.readLines()
        .filterNot { it.startsWith("  ") }
        .map { it.split(" ") }
        .filter { WORD_RE.matches(it[0]) && it[0].length in 3..16 }
        .associate { fields ->
            val pointerCount = fields[3].toInt()
            fields[0] to fields[6 + pointerCount]
        }

fun main(args: Array<String>) {
    if (args.size !in 3..4) {
        System.err.println("Usage: BuildDictionary <wordnet-dict-dir> <count_1w.txt> <cmudict.dict> [out-dir]")
        exitProcess(1)
    }
    val dictDir = Path.of(args[0])
    val ranks = loadRanks(Path.of(args[1]))
    val pronunciations = loadPronunciations(Path.of(args[2]))
    val outDir = Path.of(args.getOrElse(3) { "src/main/resources/dictionary" })

    fun isCommon(lemma: String) = lemma.split("-").all { (ranks[it] ?: Int.MAX_VALUE) <= FREQUENCY_CUTOFF }

    fun toRow(lemma: String, category: String): String {
        val phonemes = resolvePronunciation(lemma, pronunciations) ?: ""
        val syllables =
            if (phonemes.isEmpty()) "" else phonemes.split(WHITESPACE).count { it.last().isDigit() }.toString()
        return "$lemma,$phonemes,$syllables,$category"
    }

    val synsets = parseDataNoun(dictDir.resolve("data.noun"))
    val adjectives = loadIndexLemmas(dictDir.resolve("index.adj")).keys
        .filter { isCommon(it) && it !in EXCLUDE }
        .sorted()
        .associateWith { "" }
    val nouns = loadIndexLemmas(dictDir.resolve("index.noun"))
        .filterKeys { it !in synsets.instanceOnly && isCommon(it) && it !in EXCLUDE }
        .toSortedMap()
        .mapValues { (_, offset) -> synsets.categoryByOffset[offset] ?: "" }

    outDir.createDirectories()
    for ((name, words) in listOf("adjectives.csv" to adjectives, "nouns.csv" to nouns)) {
        outDir.resolve(name)
            .writeText(words.entries.joinToString("\n", postfix = "\n") { (lemma, cat) -> toRow(lemma, cat) })
        val covered = words.keys.count { resolvePronunciation(it, pronunciations) != null }
        println("$name: ${words.size} words, $covered with pronunciation")
    }
}
