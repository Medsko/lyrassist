package nl.medsko.lyrassist.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import nl.medsko.lyrassist.domain.Metaphor
import nl.medsko.lyrassist.domain.ObjectWriting
import nl.medsko.lyrassist.domain.Snippet
import nl.medsko.lyrassist.domain.Spark
import nl.medsko.lyrassist.domain.StorySeed
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

/** A Metaphor Collision "tenor is vehicle" (I.A. Richards' terms): "memory is a landlord". */
data class MetaphorPairDto(val tenor: WordDto, val vehicle: WordDto)

data class MetaphorDto(
    val id: Long,
    val tenor: WordDto,
    val vehicle: WordDto,
    val createdAt: Instant,
) {
    companion object {
        fun from(metaphor: Metaphor) =
            MetaphorDto(metaphor.id, WordDto.from(metaphor.tenor), WordDto.from(metaphor.vehicle), metaphor.createdAt)
    }
}

data class SaveMetaphorRequest(val tenorId: Long, val vehicleId: Long)

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

data class RhymeWordDto(val lemma: String, val syllableCount: Int?)

/** One band of the rhyme spectrum; [words] is capped, [total] is the full match count. */
data class RhymeGroupDto(val total: Int, val words: List<RhymeWordDto>)

data class RhymeResultDto(
    val word: String,
    val pronunciation: String,
    val syllableCount: Int?,
    val perfect: RhymeGroupDto,
    val family: RhymeGroupDto,
    val additive: RhymeGroupDto,
    val subtractive: RhymeGroupDto,
    val assonance: RhymeGroupDto,
    val consonance: RhymeGroupDto,
)

data class StorySeedPromptDto(val who: WordDto, val where: String, val conflict: String)

data class StorySeedDto(
    val id: Long,
    val who: WordDto,
    val where: String,
    val conflict: String,
    val createdAt: Instant,
) {
    companion object {
        fun from(seed: StorySeed) =
            StorySeedDto(seed.id, WordDto.from(seed.who), seed.whereText, seed.conflict, seed.createdAt)
    }
}

data class SaveStorySeedRequest(
    val whoId: Long,
    @field:NotBlank
    @field:Size(max = 200)
    val where: String,
    @field:NotBlank
    @field:Size(max = 200)
    val conflict: String,
)

data class SnippetDto(
    val id: Long,
    val title: String,
    val content: String,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        fun from(snippet: Snippet) =
            SnippetDto(snippet.id, snippet.title, snippet.content, snippet.createdAt, snippet.updatedAt)
    }
}

/** Title is deliberately optional: saving a jotted line must stay frictionless. */
data class SaveSnippetRequest(
    @field:Size(max = 200)
    val title: String = "",
    @field:NotBlank
    @field:Size(max = 50_000)
    val content: String,
)

data class SaveObjectWritingRequest(
    val nounId: Long,
    @field:NotBlank
    @field:Size(max = 50_000)
    val body: String,
    @field:Min(10)
    @field:Max(3600)
    val durationSeconds: Int,
)
