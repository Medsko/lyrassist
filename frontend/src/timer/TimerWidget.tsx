import { Button, Dropdown } from 'react-bootstrap'
import { useTimer } from './TimerContext'

const PRESETS_MINUTES = [5, 10, 20]

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// The app-wide countdown, upper right in the navbar.
export default function TimerWidget() {
  const timer = useTimer()

  if (timer.status === 'finished') {
    return (
      <Button variant="danger" size="sm" className="timer-finished" onClick={timer.dismiss}>
        Time! ✕
      </Button>
    )
  }

  if (timer.status === 'running') {
    const urgent = timer.remainingSeconds <= 30
    return (
      <Button
        variant={urgent ? 'outline-danger' : 'outline-light'}
        size="sm"
        className={`timer-countdown${urgent ? ' timer-urgent' : ''}`}
        onClick={timer.cancel}
        title="Click to cancel the timer"
      >
        {formatTime(timer.remainingSeconds)}
      </Button>
    )
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="outline-secondary" size="sm" id="timer-menu">
        ⏱ Timer
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {PRESETS_MINUTES.map((minutes) => (
          <Dropdown.Item key={minutes} onClick={() => timer.start(minutes * 60)}>
            {minutes} minutes
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}
