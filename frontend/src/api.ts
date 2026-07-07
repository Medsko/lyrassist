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
