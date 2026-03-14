// Dark mode only - light theme removed
export type Theme = 'dark'

export function getInitialTheme(): Theme {
  return 'dark'
}

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', 'dark')
}

export function toggleTheme() {
  return 'dark'
}

