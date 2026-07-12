package nl.medsko.lyrassist.controller

import jakarta.validation.Valid
import nl.medsko.lyrassist.dto.SaveSnippetRequest
import nl.medsko.lyrassist.dto.SnippetDto
import nl.medsko.lyrassist.service.SnippetService
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
@RequestMapping("/api/snippets")
class SnippetController(private val snippetService: SnippetService) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: SaveSnippetRequest): SnippetDto =
        snippetService.create(request.title, request.content)

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: SaveSnippetRequest): SnippetDto =
        snippetService.update(id, request.title, request.content)

    @GetMapping
    fun list(): List<SnippetDto> = snippetService.findAll()

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) = snippetService.delete(id)
}
