package nl.medsko.lyrassist.seed

import nl.medsko.lyrassist.domain.PartOfSpeech
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.core.io.ClassPathResource
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.sql.Types

/**
 * Loads the bundled WordNet-derived word lists into the word table on first start.
 * Runs only when the table is empty, so it is idempotent across restarts.
 *
 * Databases seeded before the CSVs carried pronunciation data get a one-time
 * in-place backfill instead, preserving saved sparks and pieces.
 */
@Component
class DictionarySeeder(private val jdbcTemplate: JdbcTemplate) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(javaClass)

    private data class Row(val lemma: String, val pronunciation: String?, val syllableCount: Int?)

    override fun run(args: ApplicationArguments) {
        val wordCount = jdbcTemplate.queryForObject("SELECT count(*) FROM word", Long::class.java) ?: 0
        if (wordCount == 0L) {
            seed("dictionary/adjectives.csv", PartOfSpeech.ADJECTIVE)
            seed("dictionary/nouns.csv", PartOfSpeech.NOUN)
            return
        }
        val pronounced =
            jdbcTemplate.queryForObject("SELECT count(*) FROM word WHERE pronunciation IS NOT NULL", Long::class.java)
                ?: 0
        if (pronounced > 0) {
            log.info("Dictionary already seeded ({} words, {} with pronunciation), skipping", wordCount, pronounced)
            return
        }
        backfill("dictionary/adjectives.csv", PartOfSpeech.ADJECTIVE)
        backfill("dictionary/nouns.csv", PartOfSpeech.NOUN)
    }

    private fun seed(resourcePath: String, partOfSpeech: PartOfSpeech) {
        val rows = readRows(resourcePath)
        jdbcTemplate.batchUpdate(
            "INSERT INTO word (lemma, part_of_speech, pronunciation, syllable_count) VALUES (?, ?, ?, ?)",
            rows,
            BATCH_SIZE,
        ) { ps, row ->
            ps.setString(1, row.lemma)
            ps.setString(2, partOfSpeech.name)
            ps.setString(3, row.pronunciation)
            ps.setObject(4, row.syllableCount, Types.INTEGER)
        }
        log.info("Seeded {} {}s from {}", rows.size, partOfSpeech.name.lowercase(), resourcePath)
    }

    private fun backfill(resourcePath: String, partOfSpeech: PartOfSpeech) {
        val rows = readRows(resourcePath).filter { it.pronunciation != null }
        jdbcTemplate.batchUpdate(
            "UPDATE word SET pronunciation = ?, syllable_count = ? WHERE lemma = ? AND part_of_speech = ?",
            rows,
            BATCH_SIZE,
        ) { ps, row ->
            ps.setString(1, row.pronunciation)
            ps.setObject(2, row.syllableCount, Types.INTEGER)
            ps.setString(3, row.lemma)
            ps.setString(4, partOfSpeech.name)
        }
        log.info("Backfilled pronunciation for {} {}s from {}", rows.size, partOfSpeech.name.lowercase(), resourcePath)
    }

    private fun readRows(resourcePath: String): List<Row> =
        ClassPathResource(resourcePath).inputStream.bufferedReader().readLines()
            .filter { it.isNotBlank() }
            .map { line ->
                val (lemma, pronunciation, syllables) = line.split(",")
                Row(lemma, pronunciation.ifEmpty { null }, syllables.toIntOrNull())
            }

    companion object {
        private const val BATCH_SIZE = 1000
    }
}
