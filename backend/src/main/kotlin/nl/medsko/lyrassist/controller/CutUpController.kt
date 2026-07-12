package nl.medsko.lyrassist.controller

import jakarta.validation.Valid
import nl.medsko.lyrassist.dto.CutUpRequest
import nl.medsko.lyrassist.service.CutUpService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/cut-up")
class CutUpController(private val cutUpService: CutUpService) {

    // POST rather than GET: the source text travels in the body. Each call
    // cuts and shuffles anew, so "cut again" is simply a repeat request.
    @PostMapping("/fragments")
    fun fragments(@Valid @RequestBody request: CutUpRequest): List<String> =
        cutUpService.cutUp(request.text, request.snippetIds, request.fragmentSize)
}
