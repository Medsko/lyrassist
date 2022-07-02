package com.medsko.lyrassist.model

import javax.persistence.CascadeType
import javax.persistence.EmbeddedId
import javax.persistence.Entity
import javax.persistence.JoinColumn
import javax.persistence.ManyToMany
import javax.persistence.ManyToOne
import javax.persistence.OneToOne

@Entity
class SongSnippet(
    // TODO: bleek toch niet zo moeilijk, maar check alsnog ff:
    //  https://stackoverflow.com/questions/50931495/mapping-a-composite-foreign-key-to-a-composite-primary-key
    @EmbeddedId
    val songSnippetKey: SongSnippetKey
)
