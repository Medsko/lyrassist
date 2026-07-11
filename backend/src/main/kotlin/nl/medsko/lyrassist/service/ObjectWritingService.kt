package nl.medsko.lyrassist.service

import nl.medsko.lyrassist.domain.ObjectWriting
import nl.medsko.lyrassist.domain.PartOfSpeech
import nl.medsko.lyrassist.dto.ObjectWritingDto
import nl.medsko.lyrassist.dto.WordDto
import nl.medsko.lyrassist.repository.ObjectWritingRepository
import nl.medsko.lyrassist.repository.WordRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class ObjectWritingService(
    private val objectWritingRepository: ObjectWritingRepository,
    private val wordRepository: WordRepository,
) {

    @Transactional(readOnly = true)
    fun randomPrompt(): WordDto =
        wordRepository.findRandomByCategoryIn(CONCRETE_CATEGORIES, 1)
            .firstOrNull()
            ?.let(WordDto::from)
            ?: throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Dictionary is empty")

    @Transactional
    fun save(nounId: Long, body: String, durationSeconds: Int): ObjectWritingDto {
        val noun = wordRepository.findByIdOrNull(nounId)
            ?.takeIf { it.partOfSpeech == PartOfSpeech.NOUN }
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "No noun with id $nounId")
        return ObjectWritingDto.from(
            objectWritingRepository.save(
                ObjectWriting(noun = noun, body = body, durationSeconds = durationSeconds),
            ),
        )
    }

    @Transactional(readOnly = true)
    fun findAll(): List<ObjectWritingDto> =
        objectWritingRepository.findAllByOrderByCreatedAtDesc().map(ObjectWritingDto::from)

    @Transactional
    fun delete(id: Long) {
        if (!objectWritingRepository.existsById(id)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "No object writing with id $id")
        }
        objectWritingRepository.deleteById(id)
    }

    companion object {
        /**
         * Pattison wants concrete, sense-writable objects, not abstractions
         * like "perfection" — so prompts draw only from physical categories.
         */
        private val CONCRETE_CATEGORIES = listOf(
            "noun.animal", "noun.artifact", "noun.body", "noun.food",
            "noun.object", "noun.plant", "noun.substance",
        )
    }
}
