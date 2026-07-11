package nl.medsko.lyrassist.service

import nl.medsko.lyrassist.domain.Word
import nl.medsko.lyrassist.dto.RhymeGroupDto
import nl.medsko.lyrassist.dto.RhymeResultDto
import nl.medsko.lyrassist.dto.RhymeWordDto
import nl.medsko.lyrassist.repository.WordRepository
import nl.medsko.lyrassist.rhyme.RhymeClassifier
import nl.medsko.lyrassist.rhyme.RhymeType
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class RhymeService(private val wordRepository: WordRepository) {

    @Transactional(readOnly = true)
    fun explore(word: String): RhymeResultDto {
        val lemma = word.trim().lowercase()
        val target = wordRepository.findFirstByLemmaAndPronunciationIsNotNull(lemma)
            ?: throw ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "No pronunciation known for '$lemma' - try another word",
            )
        val targetPronunciation = requireNotNull(target.pronunciation)

        // A lemma can occur as both adjective and noun; rhyme-wise they are one word.
        val candidates = wordRepository.findByPronunciationIsNotNull()
            .filter { it.lemma != lemma }
            .distinctBy { it.lemma }
        val byType = candidates.groupBy { RhymeClassifier.classify(targetPronunciation, it.pronunciation!!) }

        fun group(type: RhymeType): RhymeGroupDto {
            val words = (byType[type] ?: emptyList())
                .sortedWith(compareBy({ it.syllableCount }, { it.lemma }))
            return RhymeGroupDto(words.size, words.take(GROUP_CAP).map(::toDto))
        }

        return RhymeResultDto(
            word = target.lemma,
            pronunciation = targetPronunciation,
            syllableCount = target.syllableCount,
            perfect = group(RhymeType.PERFECT),
            family = group(RhymeType.FAMILY),
            additive = group(RhymeType.ADDITIVE),
            subtractive = group(RhymeType.SUBTRACTIVE),
            assonance = group(RhymeType.ASSONANCE),
            consonance = group(RhymeType.CONSONANCE),
        )
    }

    private fun toDto(word: Word) = RhymeWordDto(word.lemma, word.syllableCount)

    companion object {
        private const val GROUP_CAP = 50
    }
}
