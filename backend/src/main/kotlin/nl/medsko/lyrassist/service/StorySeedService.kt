package nl.medsko.lyrassist.service

import nl.medsko.lyrassist.domain.PartOfSpeech
import nl.medsko.lyrassist.domain.StorySeed
import nl.medsko.lyrassist.dto.StorySeedDto
import nl.medsko.lyrassist.dto.StorySeedPromptDto
import nl.medsko.lyrassist.dto.WordDto
import nl.medsko.lyrassist.repository.StorySeedRepository
import nl.medsko.lyrassist.repository.WordRepository
import org.springframework.core.io.ClassPathResource
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class StorySeedService(
    private val storySeedRepository: StorySeedRepository,
    private val wordRepository: WordRepository,
) {

    private val wheres = readLines("story-seeds/wheres.txt")
    private val conflicts = readLines("story-seeds/conflicts.txt")

    @Transactional(readOnly = true)
    fun prompt(): StorySeedPromptDto {
        val who = wordRepository.findRandomByCategoryIn(listOf(PERSON_CATEGORY), 1)
            .firstOrNull()
            ?: throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Dictionary is empty")
        return StorySeedPromptDto(WordDto.from(who), wheres.random(), conflicts.random())
    }

    @Transactional
    fun save(whoId: Long, whereText: String, conflict: String): StorySeedDto {
        val who = wordRepository.findByIdOrNull(whoId)
            ?.takeIf { it.partOfSpeech == PartOfSpeech.NOUN }
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "No noun with id $whoId")
        return StorySeedDto.from(
            storySeedRepository.save(StorySeed(who = who, whereText = whereText, conflict = conflict)),
        )
    }

    @Transactional(readOnly = true)
    fun findAll(): List<StorySeedDto> =
        storySeedRepository.findAllByOrderByCreatedAtDesc().map(StorySeedDto::from)

    @Transactional
    fun delete(id: Long) {
        if (!storySeedRepository.existsById(id)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "No story seed with id $id")
        }
        storySeedRepository.deleteById(id)
    }

    private fun readLines(resourcePath: String): List<String> =
        ClassPathResource(resourcePath).inputStream.bufferedReader().readLines().filter { it.isNotBlank() }

    companion object {
        private const val PERSON_CATEGORY = "noun.person"
    }
}
