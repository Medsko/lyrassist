package nl.medsko.lyrassist.repository

import nl.medsko.lyrassist.domain.Snippet
import org.springframework.data.jpa.repository.JpaRepository

interface SnippetRepository : JpaRepository<Snippet, Long> {
    fun findAllByOrderByUpdatedAtDesc(): List<Snippet>
}
