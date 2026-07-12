import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Form, Modal, Row } from 'react-bootstrap'
import { createSeed, cutUp, deleteSeed, fetchSeeds, fetchSnippets, type Snippet } from '../api'
import TextPicker from '../components/TextPicker'
import { useNotepad } from '../notepad/NotepadContext'
import { snippetLabel } from '../snippets'


export default function CutUp() {
  const notepad = useNotepad()
  const [text, setText] = useState('')
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [fragmentSize, setFragmentSize] = useState(3)
  const [fragments, setFragments] = useState<string[]>([])
  const [sent, setSent] = useState<Set<number>>(new Set())
  const [cutting, setCutting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSeedOpen, setSaveSeedOpen] = useState(false)
  const [seedTitle, setSeedTitle] = useState('')
  const [seedSource, setSeedSource] = useState('')
  const [savingSeed, setSavingSeed] = useState(false)
  const [seedPickerOpen, setSeedPickerOpen] = useState(false)

  useEffect(() => {
    fetchSnippets().then(setSnippets).catch((e: Error) => setError(e.message))
  }, [])

  const hasSource = text.trim() !== '' || selectedIds.size > 0

  function toggleSnippet(id: number) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function cut() {
    setCutting(true)
    setError(null)
    try {
      setFragments(await cutUp(text, [...selectedIds], fragmentSize))
      setSent(new Set())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setCutting(false)
    }
  }

  async function saveSeed() {
    setSavingSeed(true)
    setError(null)
    try {
      await createSeed(seedTitle, seedSource, text)
      setSaveSeedOpen(false)
      setSeedTitle('')
      setSeedSource('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSavingSeed(false)
    }
  }

  function sendToNotepad(fragment: string, index: number) {
    notepad.append(fragment)
    setSent((current) => new Set(current).add(index))
  }

  return (
    <>
      <h1 className="h3 mb-4">Cut-Up</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Row className="g-4">
        <Col lg={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form.Label htmlFor="cutup-text">Text to shred</Form.Label>
              <Form.Control
                id="cutup-text"
                as="textarea"
                rows={6}
                className="mb-3"
                placeholder="Paste a page, a poem, yesterday's news…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="d-flex gap-2 mb-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={text.trim() === ''}
                  onClick={() => setSaveSeedOpen(true)}
                >
                  Save seed
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => setSeedPickerOpen(true)}>
                  Open seed…
                </Button>
              </div>
              <Form.Label>…and/or saved snippets</Form.Label>
              {snippets.length === 0 ? (
                <p className="text-body-secondary small">
                  No saved snippets yet — the notepad saves them.
                </p>
              ) : (
                <div className="mb-3">
                  {snippets.map((snippet) => (
                    <Form.Check
                      key={snippet.id}
                      id={`cutup-snippet-${snippet.id}`}
                      type="checkbox"
                      label={snippetLabel(snippet)}
                      checked={selectedIds.has(snippet.id)}
                      onChange={() => toggleSnippet(snippet.id)}
                    />
                  ))}
                </div>
              )}
              <Form.Label htmlFor="fragment-size">
                Fragment size: <strong>{fragmentSize}</strong> {fragmentSize === 1 ? 'word' : 'words'}
              </Form.Label>
              {fragmentSize > 1 && (
                <div className="form-text mb-2">
                  Some fragments come out a word longer or shorter — deliberate raggedness, like real scissors.
                </div>
              )}
              <Row className="align-items-center g-3">
                <Col>
                  <Form.Range
                    id="fragment-size"
                    min={1}
                    max={6}
                    value={fragmentSize}
                    onChange={(e) => setFragmentSize(Number(e.target.value))}
                  />
                </Col>
                <Col xs="auto">
                  <Button onClick={cut} disabled={!hasSource || cutting}>
                    {cutting ? 'Cutting…' : fragments.length > 0 ? 'Cut again' : 'Cut up'}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          {fragments.length > 0 && (
            <>
              <p className="text-body-secondary small mb-2">
                Click a fragment to send it to the notepad.
              </p>
              <div className="d-flex flex-wrap gap-2">
                {fragments.map((fragment, index) => (
                  <Button
                    key={index}
                    variant={sent.has(index) ? 'secondary' : 'outline-secondary'}
                    size="sm"
                    className="rounded-pill"
                    onClick={() => sendToNotepad(fragment, index)}
                    title={sent.has(index) ? 'Sent — click to send again' : 'Send to the notepad'}
                  >
                    {fragment}
                  </Button>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>

      <Modal show={saveSeedOpen} onHide={() => setSaveSeedOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Save seed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label htmlFor="seed-title">Title (optional)</Form.Label>
          <Form.Control
            id="seed-title"
            autoFocus
            maxLength={200}
            placeholder="Howl, first section"
            value={seedTitle}
            onChange={(e) => setSeedTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void saveSeed()
            }}
          />
        </Modal.Body>
        <Modal.Body>
          <Form.Label htmlFor="seed-source">Source (optional)</Form.Label>
          <Form.Control
            id="seed-source"
            autoFocus
            maxLength={200}
            placeholder="Author, artist or website"
            value={seedSource}
            onChange={(e) => setSeedSource(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void saveSeed()
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSaveSeedOpen(false)}>
            Cancel
          </Button>
          <Button onClick={saveSeed} disabled={savingSeed}>
            {savingSeed ? 'Saving…' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>

      <TextPicker
        show={seedPickerOpen}
        onHide={() => setSeedPickerOpen(false)}
        noun="seed"
        emptyMessage="No saved seeds yet — paste a text and hit Save seed."
        fetchItems={fetchSeeds}
        deleteItem={deleteSeed}
        onPick={(seed) => {
          setText(seed.content)
          return true
        }}
      />
    </>
  )
}
