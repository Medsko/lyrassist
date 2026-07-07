package nl.medsko.lyrassist.controller

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import nl.medsko.lyrassist.dto.PairDto
import nl.medsko.lyrassist.service.WordSparksService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/word-sparks")
class WordSparksController(private val wordSparksService: WordSparksService) {

    @GetMapping("/pairs")
    fun pairs(
        @RequestParam @Min(1) @Max(20) count: Int,
    ): List<PairDto> = wordSparksService.generatePairs(count)
}
