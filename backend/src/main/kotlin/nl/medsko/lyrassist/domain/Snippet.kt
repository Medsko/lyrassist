package nl.medsko.lyrassist.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

/**
 * Reusable free text at any granularity — a line, a verse, a whole song.
 * The notepad writes them; inspiration modes (cut-up, ...) will mine them.
 */
@Entity
@Table(name = "snippet")
class Snippet(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    var title: String = "",
    @Column(columnDefinition = "text")
    var content: String,
    val createdAt: Instant = Instant.now(),
    var updatedAt: Instant = Instant.now(),
)
