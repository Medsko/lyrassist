package nl.medsko.lyrassist.repository

import nl.medsko.lyrassist.domain.Spark
import org.springframework.data.jpa.repository.JpaRepository

interface SparkRepository : JpaRepository<Spark, Long> {

    fun findAllByOrderByCreatedAtDesc(): List<Spark>

    fun existsByAdjectiveIdAndNounId(adjectiveId: Long, nounId: Long): Boolean
}
