package com.medsko.lyrassist.model

import javax.persistence.*

@Entity
/**
 * A flash of inspiration. Can be as short as two words or as long as an entire song.
 */
class Snippet(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    var rawText: String = "",

    @OneToMany(cascade = [CascadeType.ALL], mappedBy = "snippet")
    val songSnippets: List<SongSnippet> = mutableListOf()
)
