package nl.medsko.lyrassist.controller

import jakarta.validation.constraints.NotBlank
import nl.medsko.lyrassist.dto.RhymeResultDto
import nl.medsko.lyrassist.service.RhymeService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/rhymes")
class RhymeController(private val rhymeService: RhymeService) {

    @GetMapping
    fun explore(
        @RequestParam @NotBlank word: String,
    ): RhymeResultDto = rhymeService.explore(word)
}
