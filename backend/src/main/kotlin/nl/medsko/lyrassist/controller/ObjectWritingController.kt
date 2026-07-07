package nl.medsko.lyrassist.controller

import jakarta.validation.Valid
import nl.medsko.lyrassist.dto.ObjectWritingDto
import nl.medsko.lyrassist.dto.SaveObjectWritingRequest
import nl.medsko.lyrassist.dto.WordDto
import nl.medsko.lyrassist.service.ObjectWritingService
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
@RequestMapping("/api/object-writing")
class ObjectWritingController(private val objectWritingService: ObjectWritingService) {

    @GetMapping("/prompt")
    fun prompt(): WordDto = objectWritingService.randomPrompt()

    @PostMapping("/pieces")
    @ResponseStatus(HttpStatus.CREATED)
    fun save(@Valid @RequestBody request: SaveObjectWritingRequest): ObjectWritingDto =
        objectWritingService.save(request.nounId, request.body, request.durationSeconds)

    @GetMapping("/pieces")
    fun list(): List<ObjectWritingDto> = objectWritingService.findAll()

    @DeleteMapping("/pieces/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) = objectWritingService.delete(id)
}
