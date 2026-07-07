package nl.medsko.lyrassist.domain

import jakarta.persistence.Column
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
 * A completed object-writing exercise: sense-bound free writing about one noun,
 * against the clock (Pattison's ten minutes, or whatever the user chose).
 */
@Entity
@Table(name = "object_writing")
class ObjectWriting(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "noun_id")
    val noun: Word,
    @Column(columnDefinition = "text")
    val body: String,
    val durationSeconds: Int,
    val createdAt: Instant = Instant.now(),
)
