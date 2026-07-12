package nl.medsko.lyrassist.service

import nl.medsko.lyrassist.cutup.UpperCut
import nl.medsko.lyrassist.repository.SnippetRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class CutUpService(private val snippetRepository: SnippetRepository) {

    @Transactional(readOnly = true)
    fun cutUp(text: String, snippetIds: List<Long>, fragmentSize: Int): List<String> {
        val snippets = snippetRepository.findAllById(snippetIds)
        val missing = snippetIds.toSet() - snippets.map { it.id }.toSet()
        if (missing.isNotEmpty()) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "No snippet with id ${missing.first()}")
        }
        val source = (snippets.map { it.content } + text).joinToString("\n")
        if (source.isBlank()) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Provide text or at least one snippet to cut up",
            )
        }
        return UpperCut.cutUp(source, fragmentSize)
    }
}
