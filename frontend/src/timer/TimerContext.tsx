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

  const start = useCallback(
    (duration: number) => {
      clearTick()
      endTimeRef.current = Date.now() + duration * 1000
      setDurationSeconds(duration)
      setRemainingSeconds(duration)
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

  const cancel = useCallback(() => {
    clearTick()
    setStatus('idle')
    setRemainingSeconds(0)
  }, [clearTick])

  const dismiss = useCallback(() => {
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
