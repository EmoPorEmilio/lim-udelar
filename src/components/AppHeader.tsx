import { createSignal, onMount, Show } from 'solid-js'
import { Link, useLocation } from '@tanstack/solid-router'
import { AuthButton } from './AuthButton'
import { useTheme } from '../theme'

// ========================================
// SCROLL DIRECTION — shared global signal
// ========================================

const [headerVisible, setHeaderVisible] = createSignal(true)
let scrollListenerAttached = false

export function useScrollDirection() {
  onMount(() => {
    if (scrollListenerAttached) return
    scrollListenerAttached = true

    let lastScrollY = 0
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setHeaderVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false)
      }

      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  return headerVisible
}

// ========================================
// WIRE BORDER COMPONENT
// ========================================

function HeaderWireBorder() {
  const blueWirePath = `
    M -120 18
    C -80 6, -40 6, 0 18
    S 80 30, 120 18
    S 200 6, 240 18
    S 320 30, 360 18
    S 440 6, 480 18
    S 560 30, 600 18
    S 680 6, 720 18
    S 800 30, 840 18
    S 920 6, 960 18
    S 1040 30, 1080 18
    S 1160 6, 1200 18
  `

  const pinkWirePath = `
    M -120 24
    C -80 36, -40 36, 0 24
    S 80 12, 120 24
    S 200 36, 240 24
    S 320 12, 360 24
    S 440 36, 480 24
    S 560 12, 600 24
    S 680 36, 720 24
    S 800 12, 840 24
    S 920 36, 960 24
    S 1040 12, 1080 24
    S 1160 36, 1200 24
  `

  return (
    <svg
      class="vui-header__wire-border"
      viewBox="-150 0 1400 42"
      preserveAspectRatio="none"
    >
      {/* Blue wire */}
      <path d={blueWirePath} fill="none" stroke-width="3" stroke-linecap="round" style={{ stroke: 'var(--color-primary-dim)' }} />
      <path d={blueWirePath} fill="none" stroke-width="2" stroke-linecap="round" style={{ stroke: 'var(--color-blue-300)', filter: 'drop-shadow(0 0 4px var(--color-primary-glow))' }} />
      <path d={blueWirePath} fill="none" stroke-width="2" stroke-linecap="round" stroke-dasharray="8 50" class="vui-header__wire-pulse vui-header__wire-pulse--blue" />

      {/* Pink wire */}
      <path d={pinkWirePath} fill="none" stroke-width="3" stroke-linecap="round" style={{ stroke: 'var(--color-accent-dim)' }} />
      <path d={pinkWirePath} fill="none" stroke-width="2" stroke-linecap="round" style={{ stroke: 'var(--color-accent)', filter: 'drop-shadow(0 0 4px var(--color-accent-glow))' }} />
      <path d={pinkWirePath} fill="none" stroke-width="2" stroke-linecap="round" stroke-dasharray="8 50" class="vui-header__wire-pulse vui-header__wire-pulse--pink" />
    </svg>
  )
}

// ========================================
// THEME TOGGLE COMPONENT
// ========================================

function ThemeToggle(props: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={props.onToggle}
      title={props.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      class="vui-header__theme-toggle"
    >
      <Show when={props.isDark}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{ stroke: 'var(--color-blue-300)' }}>
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </Show>
      <Show when={!props.isDark}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{ stroke: 'var(--color-accent)' }}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </Show>
    </button>
  )
}

// ========================================
// MAIN HEADER COMPONENT
// ========================================

export function AppHeader() {
  const location = useLocation()
  const headerVisible = useScrollDirection()
  const { theme, toggleTheme } = useTheme()

  const linkClass = (path: string, accent?: boolean) => {
    const base = 'vui-header__link'
    const classes = [base]
    if (accent) classes.push('vui-header__link--accent')
    if (location().pathname === path) classes.push('vui-header__link--active')
    return classes.join(' ')
  }

  return (
    <header
      class="vui-header"
      classList={{
        'vui-header--hidden': !headerVisible(),
      }}
    >
      <HeaderWireBorder />

      <div class="vui-header__container">
        {/* Left: Logo + Title */}
        <Link to="/" style={{ 'text-decoration': 'none', display: 'flex', 'align-items': 'center', gap: '12px' }}>
          <div class="vui-header__logo-box">L</div>
          <span class="vui-header__title">LIM</span>
        </Link>

        {/* Right: Nav + Theme Toggle */}
        <nav class="vui-header__nav">
          <Link to="/faq" class={linkClass('/faq')}>
            FAQ
          </Link>
          <Link to="/curriculum" class={linkClass('/curriculum')}>
            PLAN
          </Link>
          <Link to="/materiales" class={linkClass('/materiales', true)}>
            MATERIALES
          </Link>
          <AuthButton />
          <ThemeToggle isDark={theme() === 'dark'} onToggle={toggleTheme} />
        </nav>
      </div>
    </header>
  )
}
