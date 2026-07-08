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
  {
    name: 'Object Writing',
    description: 'Write about one noun through all seven senses, against the clock',
    path: '/object-writing',
  },
  {
    name: 'Rhyme Explorer',
    description: 'Perfect, family and near rhymes for any word, Pattison-style',
    path: '/rhyme-explorer',
  },
  ...Array.from({ length: 9 }, () => ({
    name: 'Coming soon',
    description: 'A future way to assist your writing',
  })),
]
