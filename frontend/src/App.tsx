import { Container, Navbar } from 'react-bootstrap'
import { Link, Outlet } from 'react-router'
import TimerWidget from './timer/TimerWidget'

function App() {
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
          </div>
        </Container>
      </Navbar>
      <Container className="pb-5">
        <Outlet />
      </Container>
    </>
  )
}

export default App
