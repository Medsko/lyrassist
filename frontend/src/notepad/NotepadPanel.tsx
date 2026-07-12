import { useState } from 'react'
import { Button, Form, Offcanvas } from 'react-bootstrap'
import { useNotepad } from './NotepadContext'
import SnippetPicker from './SnippetPicker'

const EXPANDED_KEY = 'lyrassist.notepad.expanded'

// The persistent lyrics pad: a sticky side panel on wide screens (collapsible
// to a slim strip), an end-placed offcanvas sheet on narrow ones.
export default function NotepadPanel() {
  const notepad = useNotepad()
  const [expanded, setExpanded] = useState(() => localStorage.getItem(EXPANDED_KEY) !== 'false')
  const [pickerOpen, setPickerOpen] = useState(false)

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
            <Button variant="outline-secondary" size="sm" onClick={() => setPickerOpen(true)}>
              Open…
            </Button>
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
      <SnippetPicker show={pickerOpen} onHide={() => setPickerOpen(false)} />
    </>
  )
}
