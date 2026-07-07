package nl.medsko.lyrassist.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import nl.medsko.lyrassist.domain.ObjectWriting
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

data class ObjectWritingDto(
    val id: Long,
    val noun: WordDto,
    val body: String,
    val durationSeconds: Int,
    val createdAt: Instant,
) {
    companion object {
        fun from(piece: ObjectWriting) =
            ObjectWritingDto(piece.id, WordDto.from(piece.noun), piece.body, piece.durationSeconds, piece.createdAt)
    }
}

data class SaveObjectWritingRequest(
    val nounId: Long,
    @field:NotBlank
    @field:Size(max = 50_000)
    val body: String,
    @field:Min(10)
    @field:Max(3600)
    val durationSeconds: Int,
)
