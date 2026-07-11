import { useEffect, useState } from 'react'
import { Alert, Button, Card, ListGroup } from 'react-bootstrap'
import {
  deleteStorySeed,
  fetchStorySeedPrompt,
  fetchStorySeeds,
  saveStorySeed,
  type StorySeed,
  type StorySeedPrompt,
} from '../api'
import { article } from '../words'

export default function StorySeeds() {
  const [prompt, setPrompt] = useState<StorySeedPrompt | null>(null)
  const [seeds, setSeeds] = useState<StorySeed[]>([])
  const [dealing, setDealing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStorySeeds().then(setSeeds).catch((e: Error) => setError(e.message))
  }, [])

  async function deal() {
    setDealing(true)
    setError(null)
    try {
      setPrompt(await fetchStorySeedPrompt())
      setSaved(false)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setDealing(false)
    }
  }

  async function save() {
    if (!prompt) return
    setError(null)
    try {
      const seed = await saveStorySeed(prompt.who.id, prompt.where, prompt.conflict)
      setSeeds((current) => [seed, ...current])
      setSaved(true)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function remove(id: number) {
    setError(null)
    try {
      await deleteStorySeed(id)
      setSeeds((current) => current.filter((s) => s.id !== id))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <>
      <h1 className="h3 mb-4">Story Seeds</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <p className="text-body-secondary">
        A who, a where, and a trouble — enough for a narrative song to grow from.
        Deal until one of them starts talking.
      </p>
      <Card className="shadow-sm mb-4">
        <Card.Body className="text-center py-4">
          {prompt ? (
            <div className="mb-3 lh-lg">
              <div className="fs-3">
                {article(prompt.who.lemma)} <strong>{prompt.who.lemma}</strong>
              </div>
              <div className="fs-4">{prompt.where}</div>
              <div className="fs-4 fst-italic">who {prompt.conflict}</div>
            </div>
          ) : (
            <p className="text-body-secondary mb-3">
              e.g. “a locksmith / at a wedding / who owes someone an apology”
            </p>
          )}
          <div className="d-flex justify-content-center gap-2">
            <Button onClick={deal} disabled={dealing}>
              {dealing ? 'Dealing…' : prompt ? 'Deal another' : 'Deal a seed'}
            </Button>
            {prompt && (
              <Button
                variant={saved ? 'warning' : 'outline-secondary'}
                onClick={save}
                disabled={saved}
                title={saved ? 'Already saved' : 'Save this seed'}
              >
                {saved ? '★ Saved' : '☆ Save'}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <h2 className="h5 mb-3">Saved seeds</h2>
      {seeds.length === 0 ? (
        <p className="text-body-secondary">
          Nothing saved yet — deal a few seeds and keep the ones with a song in them.
        </p>
      ) : (
        <ListGroup>
          {seeds.map((seed) => (
            <ListGroup.Item key={seed.id} className="d-flex align-items-center">
              <span className="flex-grow-1">
                {article(seed.who.lemma)} <strong>{seed.who.lemma}</strong> {seed.where}{' '}
                <em>who {seed.conflict}</em>
              </span>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => remove(seed.id)}
                title="Delete this seed"
              >
                ✕
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </>
  )
}
