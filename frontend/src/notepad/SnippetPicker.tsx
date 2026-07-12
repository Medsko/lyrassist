import { deleteSnippet, fetchSnippets } from '../api'
import TextPicker from '../components/TextPicker'
import { useNotepad } from './NotepadContext'

// The "Open" dialog of the notepad: TextPicker wired to snippets and the notepad.
export default function SnippetPicker({ show, onHide }: { show: boolean; onHide: () => void }) {
  const notepad = useNotepad()

  return (
    <TextPicker
      show={show}
      onHide={onHide}
      noun="snippet"
      emptyMessage="No saved snippets yet — the notepad saves them."
      fetchItems={fetchSnippets}
      deleteItem={deleteSnippet}
      onPick={(snippet) => notepad.loadSnippet(snippet)}
      onDeleted={(snippet) => {
        if (notepad.snippetId === snippet.id) notepad.detach()
      }}
      activeId={notepad.snippetId}
    />
  )
}
