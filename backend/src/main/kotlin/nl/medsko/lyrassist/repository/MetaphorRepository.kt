package nl.medsko.lyrassist.repository

import nl.medsko.lyrassist.domain.Metaphor
import org.springframework.data.jpa.repository.JpaRepository

interface MetaphorRepository : JpaRepository<Metaphor, Long> {

    fun existsByTenorIdAndVehicleId(tenorId: Long, vehicleId: Long): Boolean

    fun findAllByOrderByCreatedAtDesc(): List<Metaphor>
}
