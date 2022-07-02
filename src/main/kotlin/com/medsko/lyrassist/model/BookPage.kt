package com.medsko.lyrassist.model

import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id

@Entity
/**
 * Random page from a book. Read it while humming your melody to yourself and select the words that 'stick', or seem
 * to fit to the meter/melody.
 */
class BookPage(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0

)
