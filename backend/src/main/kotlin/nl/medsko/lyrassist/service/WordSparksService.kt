package nl.medsko.lyrassist.service

import nl.medsko.lyrassist.domain.PartOfSpeech
import nl.medsko.lyrassist.dto.MetaphorPairDto
import nl.medsko.lyrassist.dto.PairDto
import nl.medsko.lyrassist.dto.WordDto
import nl.medsko.lyrassist.repository.WordRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class WordSparksService(private val wordRepository: WordRepository) {

    @Transactional(readOnly = true)
    fun generatePairs(count: Int): List<PairDto> {
        val adjectives = wordRepository.findRandomByPartOfSpeech(PartOfSpeech.ADJECTIVE.name, count)
        val nouns = wordRepository.findRandomByPartOfSpeech(PartOfSpeech.NOUN.name, count)
        return adjectives.zip(nouns) { adjective, noun ->
            PairDto(WordDto.from(adjective), WordDto.from(noun))
        }
    }

    /** Noun + noun collisions for the Metaphor variant: "memory is a landlord". */
    @Transactional(readOnly = true)
    fun generateMetaphorPairs(count: Int): List<MetaphorPairDto> =
        wordRepository.findRandomByPartOfSpeech(PartOfSpeech.NOUN.name, count * 2)
            .chunked(2)
            .filter { it.size == 2 }
            .map { (tenor, vehicle) -> MetaphorPairDto(WordDto.from(tenor), WordDto.from(vehicle)) }
}
