package com.medsko.lyrassist.model

import javax.persistence.CascadeType
import javax.persistence.Embeddable
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne

@Embeddable
class SongSnippetKey (
    @ManyToOne(cascade = [CascadeType.ALL])
    @JoinColumn(name = "song_id", referencedColumnName = "id")
    val song: Song,
    @ManyToOne
    @JoinColumn(name = "snippet_id", referencedColumnName = "id")
    val snippet: Snippet,
) : java.io.Serializable