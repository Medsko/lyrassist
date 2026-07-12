import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type TimerStatus = 'idle' | 'running' | 'finished'

// sessionStorage (not local): a timer belongs to one tab's writing session.
const STORAGE_KEY = 'lyrassist.timer'

interface StoredTimer {
  endTime: number
  durationSeconds: number
}

interface TimerState {
  status: TimerStatus
  /** Seconds left; meaningful while running (0 when idle/finished). */
  remainingSeconds: number
  /** The duration the current/last timer was started with. */
  durationSeconds: number
  start: (durationSeconds: number) => void
  cancel: () => void
  /** Acknowledge a finished timer, returning to idle. */
  dismiss: () => void
}

const TimerContext = createContext<TimerState | null>(null)

// One app-wide timer: it keeps counting across mode/route changes and is
// rendered by TimerWidget in the navbar.
export function TimerProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<TimerStatus>('idle')
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const endTimeRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const clearTick = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = undefined
  }, [])

  const beginTicking = useCallback(
    (endTime: number) => {
      clearTick()
      endTimeRef.current = endTime
      setRemainingSeconds(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)))
      setStatus('running')
      intervalRef.current = setInterval(() => {
        const left = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
        setRemainingSeconds(left)
        if (left <= 0) {
          clearTick()
          setStatus('finished')
        }
      }, 250)
    },
    [clearTick],
  )

  const start = useCallback(
    (duration: number) => {
      const endTime = Date.now() + duration * 1000
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ endTime, durationSeconds: duration } satisfies StoredTimer),
      )
      setDurationSeconds(duration)
      beginTicking(endTime)
    },
    [beginTicking],
  )

  // Resume a timer that survived a reload; one that ran out while the page
  // was gone still deserves its "Time!" moment.
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const { endTime, durationSeconds } = JSON.parse(raw) as Partial<StoredTimer>
      if (typeof endTime !== 'number' || typeof durationSeconds !== 'number') return
      setDurationSeconds(durationSeconds)
      if (endTime > Date.now()) beginTicking(endTime)
      else setStatus('finished')
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [beginTicking])

  const cancel = useCallback(() => {
    clearTick()
    sessionStorage.removeItem(STORAGE_KEY)
    setStatus('idle')
    setRemainingSeconds(0)
  }, [clearTick])

  const dismiss = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setStatus('idle')
    setRemainingSeconds(0)
  }, [])

  useEffect(() => clearTick, [clearTick])

  return (
    <TimerContext.Provider
      value={{ status, remainingSeconds, durationSeconds, start, cancel, dismiss }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer(): TimerState {
  const timer = useContext(TimerContext)
  if (!timer) throw new Error('useTimer must be used within TimerProvider')
  return timer
}
