package nl.medsko.lyrassist.repository

import nl.medsko.lyrassist.domain.StorySeed
import org.springframework.data.jpa.repository.JpaRepository

interface StorySeedRepository : JpaRepository<StorySeed, Long> {

    fun findAllByOrderByCreatedAtDesc(): List<StorySeed>
}
