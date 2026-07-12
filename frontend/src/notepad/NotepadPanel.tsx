import { useState } from 'react'
import { Button, Dropdown, Form, Offcanvas } from 'react-bootstrap'
import { deleteSnippet, fetchSnippets, type Snippet } from '../api'
import { snippetLabel } from '../snippets'
import { useNotepad } from './NotepadContext'

const EXPANDED_KEY = 'lyrassist.notepad.expanded'

// The persistent lyrics pad: a sticky side panel on wide screens (collapsible
// to a slim strip), an end-placed offcanvas sheet on narrow ones.
export default function NotepadPanel() {
  const notepad = useNotepad()
  const [expanded, setExpanded] = useState(() => localStorage.getItem(EXPANDED_KEY) !== 'false')
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [listError, setListError] = useState<string | null>(null)

  function toggleExpanded() {
    const next = !expanded
    localStorage.setItem(EXPANDED_KEY, String(next))
    setExpanded(next)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      void notepad.save()
    }
  }

  function onSnippetMenuToggle(nextShow: boolean) {
    if (!nextShow) return
    setListError(null)
    fetchSnippets().then(setSnippets).catch((e: Error) => setListError(e.message))
  }

  async function removeSnippet(e: React.MouseEvent, snippet: Snippet) {
    e.stopPropagation()
    try {
      await deleteSnippet(snippet.id)
      setSnippets((current) => current.filter((s) => s.id !== snippet.id))
      if (notepad.snippetId === snippet.id) notepad.detach()
    } catch (err) {
      setListError((err as Error).message)
    }
  }

  const status = notepad.saving
    ? 'Saving…'
    : notepad.saveError
      ? notepad.saveError
      : notepad.dirty
        ? 'Unsaved changes'
        : 'Saved'

  return (
    <>
      {!expanded && (
        <div className="d-none d-lg-block me-3">
          <Button variant="outline-secondary" size="sm" onClick={toggleExpanded} title="Open the notepad">
            📝
          </Button>
        </div>
      )}
      <Offcanvas
        responsive="lg"
        placement="end"
        show={notepad.show}
        onHide={() => notepad.setShow(false)}
        className={`notepad-panel me-lg-3${expanded ? '' : ' notepad-collapsed'}`}
        aria-label="Notepad"
      >
        <Offcanvas.Header closeButton className="d-lg-none">
          <Offcanvas.Title>Notepad</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column" onKeyDown={onKeyDown}>
          <div className="d-none d-lg-flex align-items-center mb-2">
            <span className="fw-semibold flex-grow-1">📝 Notepad</span>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleExpanded}
              title="Collapse the notepad"
            >
              »
            </Button>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Button variant="outline-secondary" size="sm" onClick={notepad.newDraft}>
              New
            </Button>
            <Dropdown onToggle={onSnippetMenuToggle}>
              <Dropdown.Toggle variant="outline-secondary" size="sm" id="snippet-menu">
                Open
              </Dropdown.Toggle>
              <Dropdown.Menu className="notepad-snippet-menu">
                {listError && <Dropdown.ItemText className="text-danger">{listError}</Dropdown.ItemText>}
                {!listError && snippets.length === 0 && (
                  <Dropdown.ItemText className="text-body-secondary">
                    No saved snippets yet.
                  </Dropdown.ItemText>
                )}
                {snippets.map((snippet) => (
                  <Dropdown.Item
                    key={snippet.id}
                    as="div"
                    role="button"
                    className="d-flex align-items-center gap-2"
                    active={snippet.id === notepad.snippetId}
                    onClick={() => notepad.loadSnippet(snippet)}
                  >
                    <span className="flex-grow-1 text-truncate">{snippetLabel(snippet)}</span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="py-0 px-1"
                      onClick={(e) => removeSnippet(e, snippet)}
                      title="Delete this snippet"
                    >
                      ✕
                    </Button>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <Form.Control
            className="mb-2"
            placeholder="Song title"
            aria-label="Song title"
            value={notepad.title}
            onChange={(e) => notepad.setTitle(e.target.value)}
          />
          <Form.Control
            as="textarea"
            className="notepad-text flex-grow-1 mb-2"
            placeholder="Lyrics in progress — the pad follows you across modes."
            aria-label="Lyrics draft"
            value={notepad.content}
            onChange={(e) => notepad.setContent(e.target.value)}
          />
          <div className="d-flex align-items-center">
            <span
              className={`small flex-grow-1 ${notepad.saveError ? 'text-danger' : 'text-body-secondary'}`}
            >
              {status}
            </span>
            <Button
              size="sm"
              onClick={() => void notepad.save()}
              disabled={!notepad.dirty || notepad.saving || !notepad.content.trim()}
            >
              Save
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}
