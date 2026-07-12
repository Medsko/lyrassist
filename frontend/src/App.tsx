import { useEffect, useState } from 'react'
import { Button, Container, Navbar } from 'react-bootstrap'
import { Link, Outlet } from 'react-router'
import NotepadPanel from './notepad/NotepadPanel'
import { useNotepad } from './notepad/NotepadContext'
import { applyTheme, initialTheme, storeTheme, type Theme } from './theme'
import TimerWidget from './timer/TimerWidget'

function App() {
  const notepad = useNotepad()
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => applyTheme(theme), [theme])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    storeTheme(next)
    setTheme(next)
  }

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Lyrassist
          </Navbar.Brand>
          <div className="d-flex align-items-center gap-3">
            <Navbar.Text>sparks, not songs</Navbar.Text>
            <TimerWidget />
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-lg-none"
              onClick={() => notepad.setShow(true)}
              title="Open the notepad"
            >
              📝
            </Button>
          </div>
        </Container>
      </Navbar>
      <div className="d-flex align-items-start">
        <Container className="pb-5 flex-grow-1 min-width-0">
          <Outlet />
        </Container>
        <NotepadPanel />
      </div>
    </>
  )
}

export default App
