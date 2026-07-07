package nl.medsko.lyrassist.dto

import nl.medsko.lyrassist.domain.Spark
import nl.medsko.lyrassist.domain.Word
import java.time.Instant

data class WordDto(val id: Long, val lemma: String) {
    companion object {
        fun from(word: Word) = WordDto(word.id, word.lemma)
    }
}

data class PairDto(val adjective: WordDto, val noun: WordDto)

data class SparkDto(
    val id: Long,
    val adjective: WordDto,
    val noun: WordDto,
    val createdAt: Instant,
) {
    companion object {
        fun from(spark: Spark) =
            SparkDto(spark.id, WordDto.from(spark.adjective), WordDto.from(spark.noun), spark.createdAt)
    }
}

data class SaveSparkRequest(val adjectiveId: Long, val nounId: Long)
