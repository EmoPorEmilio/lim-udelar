import { createSignal, onMount, onCleanup, Show } from 'solid-js'
import { Link, useLocation } from '@tanstack/solid-router'
import { AuthButton } from './AuthButton'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '../theme'
import { useMobile } from '../hooks/useMobile'

// ========================================
// SCROLL DIRECTION — shared global signal
// ========================================

const [headerVisible, setHeaderVisible] = createSignal(true)
let scrollListenerCount = 0
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

export function useScrollDirection() {
  onMount(() => {
    scrollListenerCount++
    if (scrollListenerCount === 1) {
      window.addEventListener('scroll', handleScroll, { passive: true })
    }

    onCleanup(() => {
      scrollListenerCount--
      if (scrollListenerCount === 0) {
        window.removeEventListener('scroll', handleScroll)
      }
    })
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
      aria-hidden="true"
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
// MAIN HEADER COMPONENT
// ========================================

export function AppHeader() {
  const location = useLocation()
  const headerVisible = useScrollDirection()
  const { theme, toggleTheme } = useTheme()
  const isMobile = useMobile()
  const [menuOpen, setMenuOpen] = createSignal(false)

  const linkClass = (path: string, accent?: boolean) => {
    const base = 'vui-header__link'
    const classes = [base]
    if (accent) classes.push('vui-header__link--accent')
    if (location().pathname === path) classes.push('vui-header__link--active')
    return classes.join(' ')
  }

  const closeMenu = () => setMenuOpen(false)

  // Close mobile menu on Escape key
  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen()) {
        closeMenu()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown))
  })

  return (
    <header
      class="vui-header"
      classList={{
        'vui-header--hidden': !headerVisible() && !menuOpen(),
      }}
    >
      <HeaderWireBorder />

      <div class="vui-header__container">
        {/* Left: Logo + Title */}
        <Link to="/" style={{ 'text-decoration': 'none', display: 'flex', 'align-items': 'center', gap: '12px' }}>
          <div class="vui-header__logo-box">L</div>
          <span class="vui-header__title">LIM</span>
        </Link>

        {/* Desktop nav */}
        <Show when={!isMobile()}>
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
        </Show>

        {/* Mobile hamburger button */}
        <Show when={isMobile()}>
          <button
            onClick={() => setMenuOpen(!menuOpen())}
            class="vui-header__theme-toggle"
            aria-expanded={menuOpen()}
            aria-label={menuOpen() ? 'Cerrar menú' : 'Abrir menú'}
            style={{ position: 'relative', 'z-index': '210' }}
          >
            <Show when={!menuOpen()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" style={{ stroke: 'var(--color-text)' }} aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </Show>
            <Show when={menuOpen()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" style={{ stroke: 'var(--color-text)' }} aria-hidden="true">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            </Show>
          </button>
        </Show>
      </div>

      {/* Mobile nav overlay */}
      <Show when={isMobile() && menuOpen()}>
        {/* Backdrop */}
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,0.8)',
            'z-index': '190',
          }}
        />
        {/* Nav drawer */}
        <nav style={{
          position: 'fixed',
          top: '0',
          right: '0',
          width: '280px',
          height: '100vh',
          background: 'var(--color-surface-elevated)',
          'z-index': '200',
          display: 'flex',
          'flex-direction': 'column',
          gap: '8px',
          padding: '80px 24px 24px',
          'border-left': '1px solid var(--color-border)',
          'overflow-y': 'auto',
        }}>
          <Link to="/faq" class={linkClass('/faq')} onClick={closeMenu} style={{ 'text-align': 'center' }}>
            FAQ
          </Link>
          <Link to="/curriculum" class={linkClass('/curriculum')} onClick={closeMenu} style={{ 'text-align': 'center' }}>
            PLAN
          </Link>
          <Link to="/materiales" class={linkClass('/materiales', true)} onClick={closeMenu} style={{ 'text-align': 'center' }}>
            MATERIALES
          </Link>
          <div style={{ 'margin-top': '8px', display: 'flex', 'justify-content': 'center' }}>
            <AuthButton />
          </div>
          <div style={{ display: 'flex', 'justify-content': 'center', 'margin-top': '4px' }}>
            <ThemeToggle isDark={theme() === 'dark'} onToggle={toggleTheme} />
          </div>
        </nav>
      </Show>
    </header>
  )
}
