package nl.medsko.lyrassist.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

/**
 * A source text for cut-up — a poem, lyrics, prose. Saved so a good text to
 * shred can be reused across sessions.
 */
@Entity
@Table(name = "seed")
class Seed(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    var title: String = "",
    /** Where the text came from — song, poem, author... */
    var source: String = "",
    @Column(columnDefinition = "text")
    var content: String,
    val createdAt: Instant = Instant.now(),
    var updatedAt: Instant = Instant.now(),
)
