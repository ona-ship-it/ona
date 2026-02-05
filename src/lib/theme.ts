/**
 * Theme Management Utilities
 * Centralized theme configuration and helper functions
 */

export type Theme = 'dark' | 'light'
export type ThemeColor = 'brand' | 'success' | 'error' | 'warning' | 'gold'

export const THEMES: Record<Theme, string> = {
  dark: 'dark',
  light: 'light',
}

export const THEME_COLORS = {
  brand: {
    primary: 'var(--brand-primary)',
    hover: 'var(--brand-primary-hover)',
    light: 'var(--brand-primary-light)',
  },
  success: {
    primary: 'var(--accent-success)',
    light: 'var(--accent-success-light)',
  },
  error: {
    primary: 'var(--accent-error)',
    light: 'var(--accent-error-light)',
  },
  warning: {
    primary: 'var(--accent-warning)',
    light: 'var(--accent-warning-light)',
  },
  gold: {
    primary: 'var(--accent-gold)',
    light: 'var(--accent-gold-light)',
    gradient: 'var(--gradient-gold)',
  },
}

/**
 * Get theme from localStorage
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const saved = localStorage.getItem('theme')
  return (saved as Theme) || 'dark'
}

/**
 * Set theme and persist to localStorage
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('theme', theme)
  document.documentElement.setAttribute('data-theme', theme)
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme(): Theme {
  const current = getTheme()
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

/**
 * Initialize theme on page load
 */
export function initTheme(): void {
  if (typeof window === 'undefined') return
  const theme = getTheme()
  document.documentElement.setAttribute('data-theme', theme)
}

/**
 * Get CSS variable value
 */
export function getCSSVar(variable: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim()
}

/**
 * Set CSS variable value
 */
export function setCSSVar(variable: string, value: string): void {
  if (typeof window === 'undefined') return
  document.documentElement.style.setProperty(variable, value)
}

/**
 * Check if system prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Get contrasting text color for background
 */
export function getContrastColor(backgroundColor: string): 'light' | 'dark' {
  // Simple contrast calculation
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? 'dark' : 'light'
}

/**
 * Create a gradient string
 */
export function createGradient(
  color1: string,
  color2: string,
  angle: number = 135
): string {
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`
}

/**
 * Class name utilities
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

/**
 * Get shadow by size
 */
export const shadows = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  glow: 'var(--shadow-glow)',
  goldGlow: 'var(--shadow-gold-glow)',
}

/**
 * Get border radius by size
 */
export const radii = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  full: 'var(--radius-full)',
}

/**
 * Get spacing value
 */
export const spacing = {
  1: 'var(--space-1)',
  2: 'var(--space-2)',
  3: 'var(--space-3)',
  4: 'var(--space-4)',
  5: 'var(--space-5)',
  6: 'var(--space-6)',
  8: 'var(--space-8)',
  10: 'var(--space-10)',
}

/**
 * Transition presets
 */
export const transitions = {
  fast: 'var(--transition-fast)',
  base: 'var(--transition-base)',
  slow: 'var(--transition-slow)',
}

/**
 * Z-index scale
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}
