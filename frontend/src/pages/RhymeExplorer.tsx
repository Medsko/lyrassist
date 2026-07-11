import { useState } from 'react'
import { Alert, Badge, Button, Card, Col, Form, Row } from 'react-bootstrap'
import { fetchRhymes, type RhymeGroup, type RhymeResult } from '../api'

// Pattison's rhyme spectrum, most to least stable. "love" examples throughout.
const GROUPS: { key: keyof Pick<RhymeResult, 'perfect' | 'family' | 'additive' | 'subtractive' | 'assonance' | 'consonance'>; title: string; hint: string }[] = [
  { key: 'perfect', title: 'Perfect', hint: 'Identical sounds from the last stressed vowel: love / dove' },
  { key: 'family', title: 'Family', hint: 'Ending consonants swapped within their family: love / enough' },
  { key: 'additive', title: 'Additive', hint: 'Ending consonants added: love / loved' },
  { key: 'subtractive', title: 'Subtractive', hint: 'Ending consonants dropped: loved / love' },
  { key: 'assonance', title: 'Assonance', hint: 'Same vowel, unrelated ending consonants: love / cut' },
  { key: 'consonance', title: 'Consonance', hint: 'Same ending consonants, different vowel: love / leave' },
]

export default function RhymeExplorer() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<RhymeResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function search(word: string) {
    const trimmed = word.trim()
    if (!trimmed) return
    setSearching(true)
    setError(null)
    try {
      setResult(await fetchRhymes(trimmed))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSearching(false)
    }
  }

  function explore(lemma: string) {
    setInput(lemma)
    void search(lemma)
  }

  const shownGroups = result ? GROUPS.filter(({ key }) => result[key].total > 0) : []

  return (
    <>
      <h1 className="h3 mb-4">Rhyme Explorer</h1>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault()
              void search(input)
            }}
          >
            <Row className="align-items-center g-3">
              <Col>
                <Form.Control
                  id="rhyme-word"
                  placeholder="A word to rhyme, e.g. love"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoFocus
                />
              </Col>
              <Col xs="auto">
                <Button type="submit" disabled={searching}>
                  {searching ? 'Exploring…' : 'Explore'}
                </Button>
              </Col>
            </Row>
          </Form>
          {result && (
            <p className="text-body-secondary small mb-0 mt-3">
              <strong>{result.word}</strong> · /{result.pronunciation}/
              {result.syllableCount != null &&
                ` · ${result.syllableCount} syllable${result.syllableCount === 1 ? '' : 's'}`}
              {' — '}a perfect rhyme is not always the strongest choice; further down the
              spectrum, the connection loosens and often gets more interesting.
            </p>
          )}
        </Card.Body>
      </Card>

      {result && shownGroups.length === 0 && (
        <p className="text-body-secondary">
          No rhymes found for <strong>{result.word}</strong> — try a different form of the word.
        </p>
      )}

      {shownGroups.map(({ key, title, hint }) => {
        const group: RhymeGroup = result![key]
        return (
          <section key={key} className="mb-4">
            <h2 className="h5 mb-1">
              {title}{' '}
              <Badge bg="secondary" pill>
                {group.total}
              </Badge>
            </h2>
            <p className="text-body-secondary small mb-2">{hint}</p>
            <div className="d-flex flex-wrap gap-2">
              {group.words.map((word) => (
                <Button
                  key={word.lemma}
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => explore(word.lemma)}
                  title={`Explore rhymes for “${word.lemma}”`}
                >
                  {word.lemma}
                </Button>
              ))}
              {group.total > group.words.length && (
                <span className="align-self-center text-body-tertiary small">
                  +{group.total - group.words.length} more
                </span>
              )}
            </div>
          </section>
        )
      })}
    </>
  )
}
