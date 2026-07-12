import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { cutUp, fetchSnippets, type Snippet } from '../api'
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
    </>
  )
}
