package nl.medsko.lyrassist.service

import java.time.Instant
import nl.medsko.lyrassist.domain.Seed
import nl.medsko.lyrassist.dto.SeedDto
import nl.medsko.lyrassist.repository.SeedRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class SeedService(private val seedRepository: SeedRepository) {

    @Transactional
    fun create(title: String, source: String, content: String): SeedDto =
        SeedDto.from(seedRepository.save(Seed(title = title, source = source, content = content)))

    @Transactional
    fun update(id: Long, title: String, source: String, content: String): SeedDto {
        val seed = seedRepository.findByIdOrNull(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "No seed with id $id")
        seed.title = title
        seed.source = source
        seed.content = content
        seed.updatedAt = Instant.now()
        return SeedDto.from(seed)
    }

    @Transactional(readOnly = true)
    fun findAll(): List<SeedDto> =
        seedRepository.findAllByOrderByUpdatedAtDesc().map(SeedDto::from)

    @Transactional
    fun delete(id: Long) {
        if (!seedRepository.existsById(id)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "No seed with id $id")
        }
        seedRepository.deleteById(id)
    }
}
