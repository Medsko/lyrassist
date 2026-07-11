package nl.medsko.lyrassist.domain

import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant

/**
 * A saved Story Seeds prompt: who (a person noun) / where / conflict.
 * Where and conflict come from curated lists bundled with the app, so they
 * are stored as text, not word references.
 */
@Entity
@Table(name = "story_seed")
class StorySeed(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "who_id")
    val who: Word,
    val whereText: String,
    val conflict: String,
    val createdAt: Instant = Instant.now(),
)
