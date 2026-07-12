export interface Word {
  id: number
  lemma: string
}

export interface Pair {
  adjective: Word
  noun: Word
}

export interface Spark {
  id: number
  adjective: Word
  noun: Word
  createdAt: string
}

class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, body?.detail ?? response.statusText)
  }
  return response.status === 204 ? (undefined as T) : response.json()
}

export function fetchPairs(count: number): Promise<Pair[]> {
  return request(`/api/word-sparks/pairs?count=${count}`)
}

export function saveSpark(adjectiveId: number, nounId: number): Promise<Spark> {
  return request('/api/sparks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adjectiveId, nounId }),
  })
}

export function fetchSparks(): Promise<Spark[]> {
  return request('/api/sparks')
}

export function deleteSpark(id: number): Promise<void> {
  return request(`/api/sparks/${id}`, { method: 'DELETE' })
}

export interface RhymeWord {
  lemma: string
  syllableCount: number | null
}

export interface RhymeGroup {
  /** Full match count; words is capped by the backend. */
  total: number
  words: RhymeWord[]
}

export interface RhymeResult {
  word: string
  pronunciation: string
  syllableCount: number | null
  perfect: RhymeGroup
  family: RhymeGroup
  additive: RhymeGroup
  subtractive: RhymeGroup
  assonance: RhymeGroup
  consonance: RhymeGroup
}

export function fetchRhymes(word: string): Promise<RhymeResult> {
  return request(`/api/rhymes?word=${encodeURIComponent(word)}`)
}

/** A Metaphor Collision "tenor is vehicle": "memory is a landlord". */
export interface MetaphorPair {
  tenor: Word
  vehicle: Word
}

export interface Metaphor {
  id: number
  tenor: Word
  vehicle: Word
  createdAt: string
}

export function fetchMetaphorPairs(count: number): Promise<MetaphorPair[]> {
  return request(`/api/word-sparks/metaphors?count=${count}`)
}

export function saveMetaphor(tenorId: number, vehicleId: number): Promise<Metaphor> {
  return request('/api/metaphors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenorId, vehicleId }),
  })
}

export function fetchMetaphors(): Promise<Metaphor[]> {
  return request('/api/metaphors')
}

export function deleteMetaphor(id: number): Promise<void> {
  return request(`/api/metaphors/${id}`, { method: 'DELETE' })
}

export interface StorySeedPrompt {
  who: Word
  where: string
  conflict: string
}

export interface StorySeed {
  id: number
  who: Word
  where: string
  conflict: string
  createdAt: string
}

export function fetchStorySeedPrompt(): Promise<StorySeedPrompt> {
  return request('/api/story-seeds/prompt')
}

export function saveStorySeed(whoId: number, where: string, conflict: string): Promise<StorySeed> {
  return request('/api/story-seeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ whoId, where, conflict }),
  })
}

export function fetchStorySeeds(): Promise<StorySeed[]> {
  return request('/api/story-seeds')
}

export function deleteStorySeed(id: number): Promise<void> {
  return request(`/api/story-seeds/${id}`, { method: 'DELETE' })
}

/** Reusable free text at any granularity — a line, a verse, a whole song. */
export interface Snippet {
  id: number
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export function fetchSnippets(): Promise<Snippet[]> {
  return request('/api/snippets')
}

export function createSnippet(title: string, content: string): Promise<Snippet> {
  return request('/api/snippets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  })
}

export function updateSnippet(id: number, title: string, content: string): Promise<Snippet> {
  return request(`/api/snippets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  })
}

export function deleteSnippet(id: number): Promise<void> {
  return request(`/api/snippets/${id}`, { method: 'DELETE' })
}

export interface ObjectWriting {
  id: number
  noun: Word
  body: string
  durationSeconds: number
  createdAt: string
}

export function fetchObjectWritingPrompt(): Promise<Word> {
  return request('/api/object-writing/prompt')
}

export function saveObjectWriting(
  nounId: number,
  body: string,
  durationSeconds: number,
): Promise<ObjectWriting> {
  return request('/api/object-writing/pieces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nounId, body, durationSeconds }),
  })
}

export function fetchObjectWritings(): Promise<ObjectWriting[]> {
  return request('/api/object-writing/pieces')
}

export function deleteObjectWriting(id: number): Promise<void> {
  return request(`/api/object-writing/pieces/${id}`, { method: 'DELETE' })
}
