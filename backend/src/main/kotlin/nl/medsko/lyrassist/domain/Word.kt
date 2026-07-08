package nl.medsko.lyrassist.domain

import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

enum class PartOfSpeech {
    ADJECTIVE,
    NOUN,
}

@Entity
@Table(name = "word")
class Word(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val lemma: String,
    @Enumerated(EnumType.STRING)
    val partOfSpeech: PartOfSpeech,
    val syllableCount: Int? = null,
    /** ARPAbet phonemes with stress digits (e.g. "L AH1 V"); null when cmudict lacks the word. */
    val pronunciation: String? = null,
)
