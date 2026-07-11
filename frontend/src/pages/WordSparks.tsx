import { useEffect, useState } from 'react'
import { Alert, Button, ButtonGroup, Card, Col, Form, ListGroup, Row } from 'react-bootstrap'
import {
  deleteMetaphor,
  deleteSpark,
  fetchMetaphorPairs,
  fetchMetaphors,
  fetchPairs,
  fetchSparks,
  saveMetaphor,
  saveSpark,
  type Metaphor,
  type Spark,
  type Word,
} from '../api'
import { article } from '../words'

const pairKey = (leftId: number, rightId: number) => `${leftId}:${rightId}`

// Both variants deal a left + right word; sparks are adjective + noun,
// metaphor collisions are tenor + vehicle ("memory is a landlord").
type Variant = 'sparks' | 'metaphors'

interface Duo {
  left: Word
  right: Word
}

type WordSide = 'left' | 'right'

interface DragSource {
  index: number
  side: WordSide
}

const VARIANTS: { key: Variant; label: string; verb: string; busy: string }[] = [
  { key: 'sparks', label: 'Adjective + noun', verb: 'Spark', busy: 'Sparking…' },
  { key: 'metaphors', label: 'Metaphor collision', verb: 'Collide', busy: 'Colliding…' },
]

export default function WordSparks() {
  const [variant, setVariant] = useState<Variant>('sparks')
  const [count, setCount] = useState(5)
  const [duos, setDuos] = useState<Record<Variant, Duo[]>>({ sparks: [], metaphors: [] })
  const [sparks, setSparks] = useState<Spark[]>([])
  const [metaphors, setMetaphors] = useState<Metaphor[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggedSource, setDraggedSource] = useState<DragSource | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchSparks().then(setSparks).catch((e: Error) => setError(e.message))
    fetchMetaphors().then(setMetaphors).catch((e: Error) => setError(e.message))
  }, [])

  const { verb, busy } = VARIANTS.find((v) => v.key === variant)!
  const pairs = duos[variant]
  const savedKeys =
    variant === 'sparks'
      ? new Set(sparks.map((s) => pairKey(s.adjective.id, s.noun.id)))
      : new Set(metaphors.map((m) => pairKey(m.tenor.id, m.vehicle.id)))

  async function generate() {
    setGenerating(true)
    setError(null)
    try {
      const dealt =
        variant === 'sparks'
          ? (await fetchPairs(count)).map((p) => ({ left: p.adjective, right: p.noun }))
          : (await fetchMetaphorPairs(count)).map((m) => ({ left: m.tenor, right: m.vehicle }))
      setDuos((current) => ({ ...current, [variant]: dealt }))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  async function save(duo: Duo) {
    setError(null)
    try {
      if (variant === 'sparks') {
        const spark = await saveSpark(duo.left.id, duo.right.id)
        setSparks((current) => [spark, ...current])
      } else {
        const metaphor = await saveMetaphor(duo.left.id, duo.right.id)
        setMetaphors((current) => [metaphor, ...current])
      }
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function removeSpark(id: number) {
    setError(null)
    try {
      await deleteSpark(id)
      setSparks((current) => current.filter((s) => s.id !== id))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function removeMetaphor(id: number) {
    setError(null)
    try {
      await deleteMetaphor(id)
      setMetaphors((current) => current.filter((m) => m.id !== id))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function onWordDragStart(e: React.DragEvent, source: DragSource) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify(source))
    setDraggedSource(source)
  }

  function onWordDragEnd() {
    setDraggedSource(null)
    setDragOverIndex(null)
  }

  function onRowDragOver(e: React.DragEvent, targetIndex: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== targetIndex) setDragOverIndex(targetIndex)
  }

  function onRowDragLeave(e: React.DragEvent<HTMLElement>, targetIndex: number) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex((current) => (current === targetIndex ? null : current))
    }
  }

  function onRowDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault()
    setDragOverIndex(null)
    let source = draggedSource
    setDraggedSource(null)
    if (!source) {
      try {
        source = JSON.parse(e.dataTransfer.getData('text/plain'))
      } catch {
        return
      }
    }
    if (!source || source.index === targetIndex) return
    const { index: sourceIndex, side } = source
    setDuos((current) => {
      const next = [...current[variant]]
      const a = next[sourceIndex]
      const b = next[targetIndex]
      if (!a || !b) return current
      next[sourceIndex] = { ...a, [side]: b[side] }
      next[targetIndex] = { ...b, [side]: a[side] }
      return { ...current, [variant]: next }
    })
  }

  function draggableWord(duo: Duo, index: number, side: WordSide, className: string) {
    const isDragOver = dragOverIndex === index && draggedSource?.index !== index
    return (
      <span
        className={className + ' spark-word' + (isDragOver && draggedSource?.side === side ? ' drag-over' : '')}
        draggable
        onDragStart={(e) => onWordDragStart(e, { index, side })}
        onDragEnd={onWordDragEnd}
      >
        {duo[side].lemma}
      </span>
    )
  }

  return (
    <>
      <h1 className="h3 mb-4">Word Sparks</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Row className="g-4">
        <Col lg={7}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div className="mb-3">
                <ButtonGroup>
                  {VARIANTS.map((v) => (
                    <Button
                      key={v.key}
                      variant={variant === v.key ? 'primary' : 'outline-primary'}
                      onClick={() => setVariant(v.key)}
                    >
                      {v.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
              <Form.Label htmlFor="pair-count">
                Number of pairs: <strong>{count}</strong>
              </Form.Label>
              <Row className="align-items-center g-3">
                <Col>
                  <Form.Range
                    id="pair-count"
                    min={1}
                    max={20}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                  />
                </Col>
                <Col xs="auto">
                  <Button onClick={generate} disabled={generating}>
                    {generating ? busy : verb}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {pairs.length > 0 && (
            <>
              <p className="text-body-secondary small mb-2">
                Drag a word onto another pair to swap it in — the word of the same kind there
                comes back to where you dragged from.
              </p>
              <ListGroup>
                {pairs.map((duo, index) => {
                  const saved = savedKeys.has(pairKey(duo.left.id, duo.right.id))
                  return (
                    <ListGroup.Item
                      key={index}
                      className="d-flex align-items-center"
                      onDragOver={(e) => onRowDragOver(e, index)}
                      onDragLeave={(e) => onRowDragLeave(e, index)}
                      onDrop={(e) => onRowDrop(e, index)}
                    >
                      {variant === 'sparks' ? (
                        <>
                          {draggableWord(duo, index, 'left', 'w-50 text-end pe-2')}
                          {draggableWord(duo, index, 'right', 'w-50 ps-2 fw-semibold')}
                        </>
                      ) : (
                        <>
                          {draggableWord(duo, index, 'left', 'w-50 text-end pe-2 fw-semibold')}
                          <span className="text-body-secondary px-1 text-nowrap">
                            is {article(duo.right.lemma)}
                          </span>
                          {draggableWord(duo, index, 'right', 'w-50 ps-1 fw-semibold')}
                        </>
                      )}
                      <Button
                        variant={saved ? 'warning' : 'outline-secondary'}
                        size="sm"
                        onClick={() => save(duo)}
                        disabled={saved}
                        title={saved ? 'Already saved' : variant === 'sparks' ? 'Save this spark' : 'Save this metaphor'}
                      >
                        {saved ? '★' : '☆'}
                      </Button>
                    </ListGroup.Item>
                  )
                })}
              </ListGroup>
            </>
          )}
        </Col>

        <Col lg={5}>
          {variant === 'sparks' ? (
            <>
              <h2 className="h5 mb-3">Saved sparks</h2>
              {sparks.length === 0 ? (
                <p className="text-body-secondary">
                  Nothing saved yet — generate some pairs and star the ones that spark something.
                </p>
              ) : (
                <ListGroup>
                  {sparks.map((spark) => (
                    <ListGroup.Item key={spark.id} className="d-flex align-items-center">
                      <span className="flex-grow-1">
                        {spark.adjective.lemma} <strong>{spark.noun.lemma}</strong>
                      </span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeSpark(spark.id)}
                        title="Delete this spark"
                      >
                        ✕
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </>
          ) : (
            <>
              <h2 className="h5 mb-3">Saved metaphors</h2>
              {metaphors.length === 0 ? (
                <p className="text-body-secondary">
                  Nothing saved yet — collide some nouns and star the equations worth arguing for.
                </p>
              ) : (
                <ListGroup>
                  {metaphors.map((metaphor) => (
                    <ListGroup.Item key={metaphor.id} className="d-flex align-items-center">
                      <span className="flex-grow-1">
                        <strong>{metaphor.tenor.lemma}</strong> is {article(metaphor.vehicle.lemma)}{' '}
                        <strong>{metaphor.vehicle.lemma}</strong>
                      </span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeMetaphor(metaphor.id)}
                        title="Delete this metaphor"
                      >
                        ✕
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </>
          )}
        </Col>
      </Row>
    </>
  )
}
