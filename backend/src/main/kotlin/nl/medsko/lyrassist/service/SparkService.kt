package nl.medsko.lyrassist.service

import nl.medsko.lyrassist.domain.PartOfSpeech
import nl.medsko.lyrassist.domain.Spark
import nl.medsko.lyrassist.dto.SparkDto
import nl.medsko.lyrassist.repository.SparkRepository
import nl.medsko.lyrassist.repository.WordRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class SparkService(
    private val sparkRepository: SparkRepository,
    private val wordRepository: WordRepository,
) {

    @Transactional
    fun save(adjectiveId: Long, nounId: Long): SparkDto {
        if (sparkRepository.existsByAdjectiveIdAndNounId(adjectiveId, nounId)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "This spark is already saved")
        }
        val adjective = requireWord(adjectiveId, PartOfSpeech.ADJECTIVE)
        val noun = requireWord(nounId, PartOfSpeech.NOUN)
        return SparkDto.from(sparkRepository.save(Spark(adjective = adjective, noun = noun)))
    }

    @Transactional(readOnly = true)
    fun findAll(): List<SparkDto> = sparkRepository.findAllByOrderByCreatedAtDesc().map(SparkDto::from)

    @Transactional
    fun delete(id: Long) {
        if (!sparkRepository.existsById(id)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "No spark with id $id")
        }
        sparkRepository.deleteById(id)
    }

    private fun requireWord(id: Long, expected: PartOfSpeech) =
        wordRepository.findByIdOrNull(id)
            ?.takeIf { it.partOfSpeech == expected }
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "No ${expected.name.lowercase()} with id $id")
}
