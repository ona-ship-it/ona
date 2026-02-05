export type Theme = 'light' | 'dark'

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  
  const savedTheme = localStorage.getItem('theme') as Theme | null
  if (savedTheme) return savedTheme
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

export function toggleTheme() {
  const current = getInitialTheme()
  const newTheme = current === 'light' ? 'dark' : 'light'
  setTheme(newTheme)
  return newTheme
}

