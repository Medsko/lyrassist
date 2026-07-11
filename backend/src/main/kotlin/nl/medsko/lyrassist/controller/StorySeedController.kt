package nl.medsko.lyrassist.controller

import jakarta.validation.Valid
import nl.medsko.lyrassist.dto.SaveStorySeedRequest
import nl.medsko.lyrassist.dto.StorySeedDto
import nl.medsko.lyrassist.dto.StorySeedPromptDto
import nl.medsko.lyrassist.service.StorySeedService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/story-seeds")
class StorySeedController(private val storySeedService: StorySeedService) {

    @GetMapping("/prompt")
    fun prompt(): StorySeedPromptDto = storySeedService.prompt()

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun save(@RequestBody @Valid request: SaveStorySeedRequest): StorySeedDto =
        storySeedService.save(request.whoId, request.where, request.conflict)

    @GetMapping
    fun list(): List<StorySeedDto> = storySeedService.findAll()

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) = storySeedService.delete(id)
}
