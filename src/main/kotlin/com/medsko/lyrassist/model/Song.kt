package com.medsko.lyrassist.model

import javax.persistence.*

@Entity
class Song(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,
    @OneToMany(cascade = [CascadeType.ALL], mappedBy = "song")
    val songSnippets: List<SongSnippet> = mutableListOf(),
)
