import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { createSnippet, updateSnippet, type Snippet } from '../api'

const STORAGE_KEY = 'lyrassist.notepad'

interface Draft {
  title: string
  content: string
}

// The localStorage crash buffer: written on every edit so nothing is lost on
// reload; the backend snippet (via Save) is the real persistence.
interface Buffer extends Draft {
  snippetId: number | null
  savedTitle: string
  savedContent: string
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function loadBuffer(): Buffer {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Buffer>
      return {
        snippetId: typeof parsed.snippetId === 'number' ? parsed.snippetId : null,
        title: str(parsed.title),
        content: str(parsed.content),
        savedTitle: str(parsed.savedTitle),
        savedContent: str(parsed.savedContent),
      }
    }
  } catch {
    // Unreadable storage: start with an empty pad rather than crash the app.
  }
  return { snippetId: null, title: '', content: '', savedTitle: '', savedContent: '' }
}

interface NotepadState {
  /** Backend id of the snippet being edited; null while the draft is brand new. */
  snippetId: number | null
  title: string
  content: string
  setTitle: (title: string) => void
  setContent: (content: string) => void
  /** Append a line to the pad, e.g. a spark sent over from one of the modes. */
  append: (text: string) => void
  /** Persist the draft as a backend snippet (create on first save, update after). */
  save: () => Promise<void>
  saving: boolean
  saveError: string | null
  /** True while the draft differs from the last saved snippet state. */
  dirty: boolean
  /** Start a fresh, unsaved draft (confirms if the current one is dirty). */
  newDraft: () => void
  /** Replace the draft with a saved snippet (confirms if the current one is dirty). */
  loadSnippet: (snippet: Snippet) => void
  /** Drop the backend link (after the loaded snippet was deleted), keeping the text. */
  detach: () => void
  /** Offcanvas visibility on narrow viewports (below lg the panel is a sheet). */
  show: boolean
  setShow: (show: boolean) => void
}

const NotepadContext = createContext<NotepadState | null>(null)

// One app-wide notepad: the draft lives above the router so it survives
// mode/route changes, and NotepadPanel renders it next to the page content.
export function NotepadProvider({ children }: { children: ReactNode }) {
  const [buffer, setBuffer] = useState<Buffer>(loadBuffer)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [show, setShow] = useState(false)

  const dirty = buffer.title !== buffer.savedTitle || buffer.content !== buffer.savedContent

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer))
  }, [buffer])

  const setTitle = useCallback((title: string) => {
    setBuffer((current) => ({ ...current, title }))
  }, [])

  const setContent = useCallback((content: string) => {
    setBuffer((current) => ({ ...current, content }))
  }, [])

  const append = useCallback((text: string) => {
    setBuffer((current) => ({
      ...current,
      content: current.content ? `${current.content.trimEnd()}\n${text}` : text,
    }))
  }, [])

  const save = useCallback(async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const snippet =
        buffer.snippetId === null
          ? await createSnippet(buffer.title, buffer.content)
          : await updateSnippet(buffer.snippetId, buffer.title, buffer.content)
      setBuffer((current) => ({
        ...current,
        snippetId: snippet.id,
        savedTitle: snippet.title,
        savedContent: snippet.content,
      }))
    } catch (e) {
      setSaveError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }, [buffer.snippetId, buffer.title, buffer.content])

  const confirmDiscard = useCallback(
    () => !dirty || window.confirm('Discard unsaved notepad changes?'),
    [dirty],
  )

  const newDraft = useCallback(() => {
    if (!confirmDiscard()) return
    setSaveError(null)
    setBuffer({ snippetId: null, title: '', content: '', savedTitle: '', savedContent: '' })
  }, [confirmDiscard])

  const loadSnippet = useCallback(
    (snippet: Snippet) => {
      if (!confirmDiscard()) return
      setSaveError(null)
      setBuffer({
        snippetId: snippet.id,
        title: snippet.title,
        content: snippet.content,
        savedTitle: snippet.title,
        savedContent: snippet.content,
      })
    },
    [confirmDiscard],
  )

  const detach = useCallback(() => {
    setBuffer((current) => ({ ...current, snippetId: null, savedTitle: '', savedContent: '' }))
  }, [])

  return (
    <NotepadContext.Provider
      value={{
        snippetId: buffer.snippetId,
        title: buffer.title,
        content: buffer.content,
        setTitle,
        setContent,
        append,
        save,
        saving,
        saveError,
        dirty,
        newDraft,
        loadSnippet,
        detach,
        show,
        setShow,
      }}
    >
      {children}
    </NotepadContext.Provider>
  )
}

export function useNotepad(): NotepadState {
  const notepad = useContext(NotepadContext)
  if (!notepad) throw new Error('useNotepad must be used within NotepadProvider')
  return notepad
}
