import { useEffect, useState } from 'react'
import { Button, Form, Modal, Table } from 'react-bootstrap'
import { snippetLabel } from '../snippets'

export interface PickerItem {
  id: number
  title: string
  content: string
  updatedAt: string
  /** Where the text came from; searched along with title and content. */
  source?: string
}

interface TextPickerProps<T extends PickerItem> {
  show: boolean
  onHide: () => void
  /** What one item is called, lowercase: "snippet", "seed". Drives all labels. */
  noun: string
  emptyMessage: string
  fetchItems: () => Promise<T[]>
  deleteItem: (id: number) => Promise<void>
  /** Return true to close the modal after picking. */
  onPick: (item: T) => boolean
  onDeleted?: (item: T) => void
  activeId?: number | null
}

// A searchable "Open" dialog over saved texts (snippets, seeds, ...).
// Currently retrieves everything and filters client-side.
export default function TextPicker<T extends PickerItem>({
  show,
  onHide,
  noun,
  emptyMessage,
  fetchItems,
  deleteItem,
  onPick,
  onDeleted,
  activeId,
}: TextPickerProps<T>) {
  const [items, setItems] = useState<T[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!show) return
    setSearch('')
    setError(null)
    fetchItems().then(setItems).catch((e: Error) => setError(e.message))
  }, [show])

  const needle = search.trim().toLowerCase()
  const matches = needle
    ? items.filter(
        (s) =>
          s.title.toLowerCase().includes(needle) ||
          s.content.toLowerCase().includes(needle) ||
          (s.source ?? '').toLowerCase().includes(needle),
      )
    : items

  function open(item: T) {
    if (onPick(item)) onHide()
  }

  async function remove(e: React.MouseEvent, item: T) {
    e.stopPropagation()
    try {
      await deleteItem(item.id)
      setItems((current) => current.filter((s) => s.id !== item.id))
      onDeleted?.(item)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Open a {noun}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          type="search"
          className="mb-3"
          placeholder="Search title and content…"
          aria-label={`Search ${noun}s`}
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {error && <p className="text-danger">{error}</p>}
        {!error && items.length === 0 && (
          <p className="text-body-secondary mb-0">{emptyMessage}</p>
        )}
        {!error && items.length > 0 && matches.length === 0 && (
          <p className="text-body-secondary mb-0">Nothing matches “{search.trim()}”.</p>
        )}
        {matches.length > 0 && (
          <Table hover size="sm" className="align-middle mb-0">
            <thead>
              <tr>
                <th className="text-capitalize">{noun}</th>
                <th className="text-nowrap">Last edited</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {matches.map((item) => (
                <tr
                  key={item.id}
                  role="button"
                  className={item.id === activeId ? 'table-active' : undefined}
                  onClick={() => open(item)}
                >
                  <td>
                    <div className={item.title.trim() ? 'fw-semibold' : undefined}>
                      {snippetLabel(item)}
                    </div>
                    {item.title.trim() !== '' && (
                      <div className="text-body-secondary small text-truncate snippet-preview">
                        {item.content.split('\n').find((line) => line.trim())?.trim()}
                      </div>
                    )}
                    {item.source?.trim() && (
                      <div className="text-body-secondary small fst-italic">from {item.source}</div>
                    )}
                  </td>
                  <td className="text-body-secondary small text-nowrap">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={(e) => remove(e, item)}
                      title={`Delete this ${noun}`}
                    >
                      ✕
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  )
}
