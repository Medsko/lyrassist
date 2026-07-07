package nl.medsko.lyrassist.seed

import nl.medsko.lyrassist.domain.PartOfSpeech
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.core.io.ClassPathResource
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
 * Loads the bundled WordNet-derived word lists into the word table on first start.
 * Runs only when the table is empty, so it is idempotent across restarts.
 */
@Component
class DictionarySeeder(private val jdbcTemplate: JdbcTemplate) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun run(args: ApplicationArguments) {
        val wordCount = jdbcTemplate.queryForObject("SELECT count(*) FROM word", Long::class.java) ?: 0
        if (wordCount > 0) {
            log.info("Dictionary already seeded ({} words), skipping", wordCount)
            return
        }
        seed("dictionary/adjectives.csv", PartOfSpeech.ADJECTIVE)
        seed("dictionary/nouns.csv", PartOfSpeech.NOUN)
    }

    private fun seed(resourcePath: String, partOfSpeech: PartOfSpeech) {
        val lemmas = ClassPathResource(resourcePath).inputStream.bufferedReader().readLines()
            .filter { it.isNotBlank() }
        lemmas.chunked(BATCH_SIZE).forEach { batch ->
            jdbcTemplate.batchUpdate(
                "INSERT INTO word (lemma, part_of_speech) VALUES (?, ?)",
                batch.map { arrayOf<Any>(it, partOfSpeech.name) },
            )
        }
        log.info("Seeded {} {}s from {}", lemmas.size, partOfSpeech.name.lowercase(), resourcePath)
    }

    companion object {
        private const val BATCH_SIZE = 1000
    }
}
