package nl.medsko.lyrassist.service

import java.time.Instant
import nl.medsko.lyrassist.domain.Snippet
import nl.medsko.lyrassist.dto.SnippetDto
import nl.medsko.lyrassist.repository.SnippetRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class SnippetService(private val snippetRepository: SnippetRepository) {

    @Transactional
    fun create(title: String, content: String): SnippetDto =
        SnippetDto.from(snippetRepository.save(Snippet(title = title, content = content)))

    @Transactional
    fun update(id: Long, title: String, content: String): SnippetDto {
        val snippet = snippetRepository.findByIdOrNull(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "No snippet with id $id")
        snippet.title = title
        snippet.content = content
        snippet.updatedAt = Instant.now()
        return SnippetDto.from(snippet)
    }

    @Transactional(readOnly = true)
    fun findAll(): List<SnippetDto> =
        snippetRepository.findAllByOrderByUpdatedAtDesc().map(SnippetDto::from)

    @Transactional
    fun delete(id: Long) {
        if (!snippetRepository.existsById(id)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "No snippet with id $id")
        }
        snippetRepository.deleteById(id)
    }
}
