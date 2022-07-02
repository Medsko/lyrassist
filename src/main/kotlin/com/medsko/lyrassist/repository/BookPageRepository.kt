package com.medsko.lyrassist.repository

import com.medsko.lyrassist.model.BookPage
import org.springframework.data.repository.CrudRepository

interface BookPageRepository : CrudRepository<BookPage, Long> {

}