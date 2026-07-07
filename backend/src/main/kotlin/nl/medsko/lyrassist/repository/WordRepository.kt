package nl.medsko.lyrassist.repository

import nl.medsko.lyrassist.domain.Word
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface WordRepository : JpaRepository<Word, Long> {

    @Query(
        value = "SELECT * FROM word WHERE part_of_speech = :partOfSpeech ORDER BY random() LIMIT :count",
        nativeQuery = true,
    )
    fun findRandomByPartOfSpeech(
        @Param("partOfSpeech") partOfSpeech: String,
        @Param("count") count: Int,
    ): List<Word>
}
