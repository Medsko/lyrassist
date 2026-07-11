package nl.medsko.lyrassist.service

import nl.medsko.lyrassist.domain.Metaphor
import nl.medsko.lyrassist.domain.PartOfSpeech
import nl.medsko.lyrassist.dto.MetaphorDto
import nl.medsko.lyrassist.repository.MetaphorRepository
import nl.medsko.lyrassist.repository.WordRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class MetaphorService(
    private val metaphorRepository: MetaphorRepository,
    private val wordRepository: WordRepository,
) {

    @Transactional
    fun save(tenorId: Long, vehicleId: Long): MetaphorDto {
        if (metaphorRepository.existsByTenorIdAndVehicleId(tenorId, vehicleId)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "This metaphor is already saved")
        }
        val tenor = requireNoun(tenorId)
        val vehicle = requireNoun(vehicleId)
        return MetaphorDto.from(metaphorRepository.save(Metaphor(tenor = tenor, vehicle = vehicle)))
    }

    @Transactional(readOnly = true)
    fun findAll(): List<MetaphorDto> = metaphorRepository.findAllByOrderByCreatedAtDesc().map(MetaphorDto::from)

    @Transactional
    fun delete(id: Long) {
        if (!metaphorRepository.existsById(id)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "No metaphor with id $id")
        }
        metaphorRepository.deleteById(id)
    }

    private fun requireNoun(id: Long) =
        wordRepository.findByIdOrNull(id)
            ?.takeIf { it.partOfSpeech == PartOfSpeech.NOUN }
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "No noun with id $id")
}
