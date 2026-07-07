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
 * A saved Word Sparks idea: an adjective + noun pair the user liked.
 * Future modes producing differently-shaped ideas get their own tables.
 */
@Entity
@Table(name = "spark")
class Spark(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adjective_id")
    val adjective: Word,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "noun_id")
    val noun: Word,
    val createdAt: Instant = Instant.now(),
)
