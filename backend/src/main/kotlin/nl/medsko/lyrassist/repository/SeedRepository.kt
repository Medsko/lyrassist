package nl.medsko.lyrassist.repository

import nl.medsko.lyrassist.domain.Seed
import org.springframework.data.jpa.repository.JpaRepository

interface SeedRepository : JpaRepository<Seed, Long> {
    fun findAllByOrderByUpdatedAtDesc(): List<Seed>
}
