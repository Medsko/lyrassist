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
 * A saved Metaphor Collision: "tenor is vehicle" ("memory is a landlord").
 * Tenor/vehicle are I.A. Richards' terms: the subject and the image it borrows.
 */
@Entity
@Table(name = "metaphor")
class Metaphor(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenor_id")
    val tenor: Word,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    val vehicle: Word,
    val createdAt: Instant = Instant.now(),
)
