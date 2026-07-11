package nl.medsko.lyrassist.controller

import nl.medsko.lyrassist.dto.MetaphorDto
import nl.medsko.lyrassist.dto.SaveMetaphorRequest
import nl.medsko.lyrassist.service.MetaphorService
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
@RequestMapping("/api/metaphors")
class MetaphorController(private val metaphorService: MetaphorService) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun save(@RequestBody request: SaveMetaphorRequest): MetaphorDto =
        metaphorService.save(request.tenorId, request.vehicleId)

    @GetMapping
    fun list(): List<MetaphorDto> = metaphorService.findAll()

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) = metaphorService.delete(id)
}
