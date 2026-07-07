import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, ListGroup, Row } from 'react-bootstrap'
import {
  deleteObjectWriting,
  fetchObjectWritingPrompt,
  fetchObjectWritings,
  saveObjectWriting,
  type ObjectWriting as ObjectWritingPiece,
  type Word,
} from '../api'
import { useTimer } from '../timer/TimerContext'
import { formatTime } from '../timer/TimerWidget'

const SENSES = ['sight', 'sound', 'smell', 'taste', 'touch', 'body', 'motion']
const DURATIONS_MINUTES = [1, 2, 5, 10, 15, 20]
const DRAFT_KEY = 'object-writing-draft'

interface Draft {
  noun: Word
  body: string
  durationSeconds: number
}

function loadDraft(): Draft | null {
  const raw = sessionStorage.getItem(DRAFT_KEY)
  return raw ? (JSON.parse(raw) as Draft) : null
}

export default function ObjectWriting() {
  const timer = useTimer()
  const [minutes, setMinutes] = useState(10)
  const [draft, setDraft] = useState<Draft | null>(loadDraft)
  const [pieces, setPieces] = useState<ObjectWritingPiece[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchObjectWritings().then(setPieces).catch((e: Error) => setError(e.message))
  }, [])

  // The draft survives navigating to other modes (the timer keeps running app-wide).
  useEffect(() => {
    if (draft) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    else sessionStorage.removeItem(DRAFT_KEY)
  }, [draft])

  const timeUp = draft !== null && timer.status !== 'running'

  async function begin() {
    setError(null)
    try {
      const noun = await fetchObjectWritingPrompt()
      setDraft({ noun, body: '', durationSeconds: minutes * 60 })
      timer.start(minutes * 60)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function save() {
    if (!draft) return
    setError(null)
    try {
      const piece = await saveObjectWriting(draft.noun.id, draft.body, draft.durationSeconds)
      setPieces((current) => [piece, ...current])
      setDraft(null)
      timer.dismiss()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function discard() {
    setDraft(null)
    if (timer.status === 'running') timer.cancel()
    else timer.dismiss()
  }

  async function remove(id: number) {
    setError(null)
    try {
      await deleteObjectWriting(id)
      setPieces((current) => current.filter((p) => p.id !== id))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <>
      <h1 className="h3 mb-2">Object Writing</h1>
      <p className="text-body-secondary">
        Write about the given noun for the whole time — but only through the senses. Dive for
        detail; stop mid-sentence when the timer runs out.
      </p>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!draft ? (
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-end g-3">
              <Col xs="auto">
                <Form.Label htmlFor="ow-duration">Duration</Form.Label>
                <Form.Select
                  id="ow-duration"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  style={{ width: '10rem' }}
                >
                  {DURATIONS_MINUTES.map((m) => (
                    <option key={m} value={m}>
                      {m} minute{m > 1 ? 's' : ''}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs="auto">
                <Button onClick={begin}>Give me a noun</Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex align-items-center mb-2">
              <span className="h4 mb-0 text-capitalize">{draft.noun.lemma}</span>
              <span className={`ms-auto fs-5 ${timeUp ? 'text-danger fw-bold' : ''}`}>
                {timeUp ? "Time's up" : formatTime(timer.remainingSeconds)}
              </span>
            </div>
            <div className="mb-3">
              {SENSES.map((sense) => (
                <Badge key={sense} bg="light" text="dark" className="me-1 border">
                  {sense}
                </Badge>
              ))}
            </div>
            <Form.Control
              as="textarea"
              rows={10}
              autoFocus
              placeholder="Dive…"
              value={draft.body}
              disabled={timeUp}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
            <div className="d-flex gap-2 mt-3">
              <Button onClick={save} disabled={draft.body.trim() === ''}>
                Save
              </Button>
              <Button variant="outline-secondary" onClick={discard}>
                Discard
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      <h2 className="h5 mb-3">Past writings</h2>
      {pieces.length === 0 ? (
        <p className="text-body-secondary">No pieces yet — set the timer and dive.</p>
      ) : (
        <ListGroup>
          {pieces.map((piece) => (
            <ListGroup.Item key={piece.id}>
              <div className="d-flex align-items-center">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none fw-semibold text-capitalize"
                  onClick={() => setExpandedId(expandedId === piece.id ? null : piece.id)}
                >
                  {piece.noun.lemma}
                </button>
                <span className="text-body-secondary small ms-3">
                  {new Date(piece.createdAt).toLocaleString()} ·{' '}
                  {Math.round(piece.durationSeconds / 60)} min
                </span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="ms-auto"
                  onClick={() => remove(piece.id)}
                  title="Delete this piece"
                >
                  ✕
                </Button>
              </div>
              {expandedId === piece.id ? (
                <p className="mb-0 mt-2" style={{ whiteSpace: 'pre-wrap' }}>
                  {piece.body}
                </p>
              ) : (
                <p className="mb-0 mt-1 text-body-secondary text-truncate">{piece.body}</p>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </>
  )
}
