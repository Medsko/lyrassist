import { Card, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router'
import { MODES } from '../modes'

export default function Home() {
  return (
    <>
      <h1 className="h3 mb-4">What shall we work on?</h1>
      <Row xs={2} md={3} lg={4} className="g-3">
        {MODES.map((mode, index) => (
          <Col key={index}>
            {mode.path ? (
              <Card className="h-100 shadow-sm mode-tile">
                <Card.Body>
                  <Card.Title className="h5">
                    <Link to={mode.path} className="stretched-link text-decoration-none">
                      {mode.name}
                    </Link>
                  </Card.Title>
                  <Card.Text className="text-body-secondary small">{mode.description}</Card.Text>
                </Card.Body>
              </Card>
            ) : (
              <Card className="h-100 border-dashed text-body-tertiary">
                <Card.Body>
                  <Card.Title className="h5">{mode.name}</Card.Title>
                  <Card.Text className="small">{mode.description}</Card.Text>
                </Card.Body>
              </Card>
            )}
          </Col>
        ))}
      </Row>
    </>
  )
}
