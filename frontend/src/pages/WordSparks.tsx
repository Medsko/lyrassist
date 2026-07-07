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

export default function WordSparks() {
  const [count, setCount] = useState(5)
  const [pairs, setPairs] = useState<Pair[]>([])
  const [sparks, setSparks] = useState<Spark[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
            <ListGroup>
              {pairs.map((pair) => {
                const saved = savedKeys.has(pairKey(pair.adjective.id, pair.noun.id))
                return (
                  <ListGroup.Item
                    key={pairKey(pair.adjective.id, pair.noun.id)}
                    className="d-flex align-items-center"
                  >
                    <span className="w-50 text-end pe-2">{pair.adjective.lemma}</span>
                    <span className="w-50 ps-2 fw-semibold">{pair.noun.lemma}</span>
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
