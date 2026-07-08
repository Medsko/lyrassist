import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Form, ListGroup, Row } from 'react-bootstrap'
import {
  deleteSpark,
  fetchPairs,
  fetchSparks,
  saveSpark,
  type Pair,
  type Spark,
} from '../api'

const pairKey = (adjectiveId: number, nounId: number) => `${adjectiveId}:${nounId}`

type WordType = 'adjective' | 'noun'

interface DragSource {
  index: number
  type: WordType
}

export default function WordSparks() {
  const [count, setCount] = useState(5)
  const [pairs, setPairs] = useState<Pair[]>([])
  const [sparks, setSparks] = useState<Spark[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggedSource, setDraggedSource] = useState<DragSource | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchSparks().then(setSparks).catch((e: Error) => setError(e.message))
  }, [])

  const savedKeys = new Set(sparks.map((s) => pairKey(s.adjective.id, s.noun.id)))

  async function generate() {
    setGenerating(true)
    setError(null)
    try {
      setPairs(await fetchPairs(count))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  async function save(pair: Pair) {
    setError(null)
    try {
      const spark = await saveSpark(pair.adjective.id, pair.noun.id)
      setSparks((current) => [spark, ...current])
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function remove(id: number) {
    setError(null)
    try {
      await deleteSpark(id)
      setSparks((current) => current.filter((s) => s.id !== id))
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
    const { index: sourceIndex, type } = source
    setPairs((current) => {
      const next = [...current]
      const a = next[sourceIndex]
      const b = next[targetIndex]
      if (!a || !b) return current
      if (type === 'adjective') {
        next[sourceIndex] = { ...a, adjective: b.adjective }
        next[targetIndex] = { ...b, adjective: a.adjective }
      } else {
        next[sourceIndex] = { ...a, noun: b.noun }
        next[targetIndex] = { ...b, noun: a.noun }
      }
      return next
    })
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
                    {generating ? 'Sparking…' : 'Spark'}
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
                {pairs.map((pair, index) => {
                  const saved = savedKeys.has(pairKey(pair.adjective.id, pair.noun.id))
                  const isDragOver = dragOverIndex === index && draggedSource?.index !== index
                  return (
                    <ListGroup.Item
                      key={index}
                      className="d-flex align-items-center"
                      onDragOver={(e) => onRowDragOver(e, index)}
                      onDragLeave={(e) => onRowDragLeave(e, index)}
                      onDrop={(e) => onRowDrop(e, index)}
                    >
                      <span
                        className={
                          'w-50 text-end pe-2 spark-word' +
                          (isDragOver && draggedSource?.type === 'adjective' ? ' drag-over' : '')
                        }
                        draggable
                        onDragStart={(e) => onWordDragStart(e, { index, type: 'adjective' })}
                        onDragEnd={onWordDragEnd}
                      >
                        {pair.adjective.lemma}
                      </span>
                      <span
                        className={
                          'w-50 ps-2 fw-semibold spark-word' +
                          (isDragOver && draggedSource?.type === 'noun' ? ' drag-over' : '')
                        }
                        draggable
                        onDragStart={(e) => onWordDragStart(e, { index, type: 'noun' })}
                        onDragEnd={onWordDragEnd}
                      >
                        {pair.noun.lemma}
                      </span>
                      <Button
                        variant={saved ? 'warning' : 'outline-secondary'}
                        size="sm"
                        onClick={() => save(pair)}
                        disabled={saved}
                        title={saved ? 'Already saved' : 'Save this spark'}
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
                    onClick={() => remove(spark.id)}
                    title="Delete this spark"
                  >
                    ✕
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </>
  )
}
