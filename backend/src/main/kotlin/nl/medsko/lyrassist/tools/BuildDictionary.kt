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
 *
 * Each word is annotated with its primary CMU Pronouncing Dictionary entry
 * (ARPAbet phonemes with stress digits) and syllable count (= vowel phonemes);
 * both fields are empty for words missing from cmudict. Nouns also carry the
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
        val phonemes = pronunciations[lemma] ?: ""
        val syllables =
            if (phonemes.isEmpty()) "" else phonemes.split(WHITESPACE).count { it.last().isDigit() }.toString()
        return "$lemma,$phonemes,$syllables,$category"
    }

    val synsets = parseDataNoun(dictDir.resolve("data.noun"))
    val adjectives = loadIndexLemmas(dictDir.resolve("index.adj")).keys
        .filter(::isCommon)
        .sorted()
        .associateWith { "" }
    val nouns = loadIndexLemmas(dictDir.resolve("index.noun"))
        .filterKeys { it !in synsets.instanceOnly && isCommon(it) }
        .toSortedMap()
        .mapValues { (_, offset) -> synsets.categoryByOffset[offset] ?: "" }

    outDir.createDirectories()
    for ((name, words) in listOf("adjectives.csv" to adjectives, "nouns.csv" to nouns)) {
        outDir.resolve(name)
            .writeText(words.entries.joinToString("\n", postfix = "\n") { (lemma, cat) -> toRow(lemma, cat) })
        val covered = words.keys.count { it in pronunciations }
        println("$name: ${words.size} words, $covered with pronunciation")
    }
}
