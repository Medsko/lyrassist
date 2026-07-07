export interface Mode {
  name: string
  description: string
  path?: string
}

// The home screen shows a 4x3 grid; modes without a path render as "coming soon".
export const MODES: Mode[] = [
  {
    name: 'Word Sparks',
    description: 'Adjective + noun pairs to spark ideas',
    path: '/word-sparks',
  },
  ...Array.from({ length: 11 }, () => ({
    name: 'Coming soon',
    description: 'A future way to assist your writing',
  })),
]
