export type ThemeMode = 'light' | 'dark' | 'system'

const THEME_KEY = 'theme'
let media: MediaQueryList | null = null
let mediaListener: ((e: MediaQueryListEvent) => void) | null = null

function setDarkClass(enabled: boolean) {
  const root = document.documentElement
  root.classList.toggle('dark', enabled)
}

export function getTheme(): ThemeMode {
  const v = (localStorage.getItem(THEME_KEY) as ThemeMode | null) || 'system'
  return v
}

export function applyTheme(mode: ThemeMode) {
  try {
    localStorage.setItem(THEME_KEY, mode)
  } catch {
    /* ignore */
  }

  const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const useDark = mode === 'dark' || (mode === 'system' && prefersDark())
  setDarkClass(useDark)

  // Notify listeners (e.g., 3D scene) that theme changed
  try {
    window.dispatchEvent(new CustomEvent('themechange', { detail: { mode, isDark: useDark } }))
  } catch {}

  // manage listener for system changes only in 'system' mode
  if (mediaListener && media) {
    media.removeEventListener('change', mediaListener)
    mediaListener = null
  }
  if (mode === 'system' && window.matchMedia) {
    media = window.matchMedia('(prefers-color-scheme: dark)')
    mediaListener = () => {
      const dark = prefersDark()
      setDarkClass(dark)
      try {
        window.dispatchEvent(new CustomEvent('themechange', { detail: { mode: 'system', isDark: dark } }))
      } catch {}
    }
    media.addEventListener('change', mediaListener)
  }
}

// Initialize on module load to ensure listener is attached when using 'system'
export function initTheme() {
  applyTheme(getTheme())
}
