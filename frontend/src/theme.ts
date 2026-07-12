const THEME_KEY = 'lyrassist.theme'

export type Theme = 'light' | 'dark'

/** The user's stored choice, falling back to the system preference. */
export function initialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Bootstrap color modes key off data-bs-theme on the root element.
export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-bs-theme', theme)
}

export function storeTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme)
}
