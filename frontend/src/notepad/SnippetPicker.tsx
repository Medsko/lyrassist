import { useEffect, useState } from 'react'
import { Button, Form, Modal, Table } from 'react-bootstrap'
import { deleteSnippet, fetchSnippets, type Snippet } from '../api'
import { snippetLabel } from '../snippets'
import { useNotepad } from './NotepadContext'

// The "Open" dialog of the notepad: all saved snippets in a searchable table.
// Retrieves everything and filters client-side; paging can come when a real
// collection makes it worth it.
export default function SnippetPicker({ show, onHide }: { show: boolean; onHide: () => void }) {
  const notepad = useNotepad()
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!show) return
    setSearch('')
    setError(null)
    fetchSnippets().then(setSnippets).catch((e: Error) => setError(e.message))
  }, [show])

  const needle = search.trim().toLowerCase()
  const matches = needle
    ? snippets.filter(
        (s) => s.title.toLowerCase().includes(needle) || s.content.toLowerCase().includes(needle),
      )
    : snippets

  function open(snippet: Snippet) {
    if (notepad.loadSnippet(snippet)) onHide()
  }

  async function remove(e: React.MouseEvent, snippet: Snippet) {
    e.stopPropagation()
    try {
      await deleteSnippet(snippet.id)
      setSnippets((current) => current.filter((s) => s.id !== snippet.id))
      if (notepad.snippetId === snippet.id) notepad.detach()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Open a snippet</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          type="search"
          className="mb-3"
          placeholder="Search title and content…"
          aria-label="Search snippets"
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {error && <p className="text-danger">{error}</p>}
        {!error && snippets.length === 0 && (
          <p className="text-body-secondary mb-0">No saved snippets yet — the notepad saves them.</p>
        )}
        {!error && snippets.length > 0 && matches.length === 0 && (
          <p className="text-body-secondary mb-0">Nothing matches “{search.trim()}”.</p>
        )}
        {matches.length > 0 && (
          <Table hover size="sm" className="align-middle mb-0">
            <thead>
              <tr>
                <th>Snippet</th>
                <th className="text-nowrap">Last edited</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {matches.map((snippet) => (
                <tr
                  key={snippet.id}
                  role="button"
                  className={snippet.id === notepad.snippetId ? 'table-active' : undefined}
                  onClick={() => open(snippet)}
                >
                  <td>
                    <div className={snippet.title.trim() ? 'fw-semibold' : undefined}>
                      {snippetLabel(snippet)}
                    </div>
                    {snippet.title.trim() !== '' && (
                      <div className="text-body-secondary small text-truncate snippet-preview">
                        {snippet.content.split('\n').find((line) => line.trim())?.trim()}
                      </div>
                    )}
                  </td>
                  <td className="text-body-secondary small text-nowrap">
                    {new Date(snippet.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={(e) => remove(e, snippet)}
                      title="Delete this snippet"
                    >
                      ✕
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  )
}
