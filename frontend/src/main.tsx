import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import NotFound from './pages/NotFound.tsx'
import ObjectWriting from './pages/ObjectWriting.tsx'
import RhymeExplorer from './pages/RhymeExplorer.tsx'
import StorySeeds from './pages/StorySeeds.tsx'
import WordSparks from './pages/WordSparks.tsx'
import { TimerProvider } from './timer/TimerContext.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'word-sparks', element: <WordSparks /> },
      { path: 'object-writing', element: <ObjectWriting /> },
      { path: 'rhyme-explorer', element: <RhymeExplorer /> },
      { path: 'story-seeds', element: <StorySeeds /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TimerProvider>
      <RouterProvider router={router} />
    </TimerProvider>
  </StrictMode>,
)
