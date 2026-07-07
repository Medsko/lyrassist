import { Container, Navbar } from 'react-bootstrap'
import { Link, Outlet } from 'react-router'

function App() {
  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Lyrassist
          </Navbar.Brand>
          <Navbar.Text>sparks, not songs</Navbar.Text>
        </Container>
      </Navbar>
      <Container className="pb-5">
        <Outlet />
      </Container>
    </>
  )
}

export default App
