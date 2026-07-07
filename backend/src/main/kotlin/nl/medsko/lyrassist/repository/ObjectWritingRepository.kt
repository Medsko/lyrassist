package nl.medsko.lyrassist.repository

import nl.medsko.lyrassist.domain.ObjectWriting
import org.springframework.data.jpa.repository.JpaRepository

interface ObjectWritingRepository : JpaRepository<ObjectWriting, Long> {

    fun findAllByOrderByCreatedAtDesc(): List<ObjectWriting>
}
