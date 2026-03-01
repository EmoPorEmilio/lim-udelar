import { createSignal, onMount } from 'solid-js'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'lim-theme'

const [globalTheme, setGlobalTheme] = createSignal<Theme>('dark')
let initialized = false

function initGlobalTheme(): void {
  if (initialized) return
  if (typeof localStorage === 'undefined' || typeof document === 'undefined') return

  initialized = true

  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (saved === 'dark' || saved === 'light') {
    setGlobalTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    return
  }

  setGlobalTheme('dark')
  document.documentElement.setAttribute('data-theme', 'dark')
}

export function initTheme(): Theme {
  initGlobalTheme()
  return globalTheme()
}

export function useTheme() {
  const toggleTheme = () => {
    const newTheme = globalTheme() === 'dark' ? 'light' : 'dark'
    setGlobalTheme(newTheme)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newTheme)
    }
  }

  onMount(() => {
    initGlobalTheme()
  })

  return { theme: globalTheme, toggleTheme }
}
