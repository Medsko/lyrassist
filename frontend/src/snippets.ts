/** A snippet's/seed's display name: its title, or its first non-blank line, truncated. */
export function snippetLabel(snippet: { title: string; content: string }): string {
  const label =
    snippet.title.trim() ||
    snippet.content.split('\n').find((line) => line.trim())?.trim() ||
    'Untitled'
  return label.length > 60 ? `${label.slice(0, 60)}…` : label
}
