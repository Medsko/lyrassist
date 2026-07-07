import { Stack } from 'react-bootstrap'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router'

export default function NotFound() {
  const error = useRouteError()

  let heading = 'Nothing here yet'
  let message = "This line didn't make it into the song. Let's get you back to a verse that exists."

  if (error) {
    if (isRouteErrorResponse(error) && error.status === 404) {
      heading = 'Nothing here yet'
      message = "This line didn't make it into the song. Let's get you back to a verse that exists."
    } else {
      heading = 'Lost the melody'
      message = 'Something went off-key while loading this page. Give it another try from the top.'
    }
  }

  return (
    <Stack gap={3} className="align-items-center text-center py-5">
      <h1 className="h3">{heading}</h1>
      <p className="text-body-secondary">{message}</p>
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </Stack>
  )
}
