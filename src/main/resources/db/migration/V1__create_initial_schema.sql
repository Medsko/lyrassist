
create table BookPage(
    id bigint primary key,
    text text not null
)

create table Word(
    id bigint primary key,

    syllables int not null,
    rhyme varchar,              -- todo: dit zit ws complexer dan dit
)

create table Song(
    id bigint primary key,
    work_title varchar,         -- todo: unique per user maken

)

create table Snippet(
    id bigint primary key,
    raw_text varchar not null,

    repeats integer,            -- todo: deze twee velden overdenken
    lines integer,

)

create table SongSnippet(
    song_id bigint,
    snippet_id bigint,
    position integer,

    primary key (song_id, snippet_id),

    constraint fk_song
        foreign key (song_id)
        references Song(id)
    constraint fk_snippet
        foreign key (snippet_id)
        references Snippet(id)
)
