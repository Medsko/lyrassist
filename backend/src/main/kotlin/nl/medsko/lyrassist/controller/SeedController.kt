package nl.medsko.lyrassist.controller

import jakarta.validation.Valid
import nl.medsko.lyrassist.dto.SaveSeedRequest
import nl.medsko.lyrassist.dto.SeedDto
import nl.medsko.lyrassist.service.SeedService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/seeds")
class SeedController(private val seedService: SeedService) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: SaveSeedRequest): SeedDto =
        seedService.create(request.title, request.source, request.content)

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: SaveSeedRequest): SeedDto =
        seedService.update(id, request.title, request.source, request.content)

    @GetMapping
    fun list(): List<SeedDto> = seedService.findAll()

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) = seedService.delete(id)
}
