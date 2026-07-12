import type { Snippet } from './api'

/** A snippet's display name: its title, or its first non-blank line, truncated. */
export function snippetLabel(snippet: Snippet): string {
  const label =
    snippet.title.trim() ||
    snippet.content.split('\n').find((line) => line.trim())?.trim() ||
    'Untitled'
  return label.length > 60 ? `${label.slice(0, 60)}…` : label
}
