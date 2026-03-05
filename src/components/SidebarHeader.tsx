import { Show } from 'solid-js'
import { Link } from '@tanstack/solid-router'
import { useScrollDirection } from './AppHeader'
import { useTheme } from '../theme'
import { useMobile } from '../hooks/useMobile'

/**
 * Fixed overlay at top-left that reveals logo + theme toggle when the main header hides on scroll.
 * Sits behind the header (z-index 99 vs header's 100) so it's invisible until the header fades out.
 * Hidden on mobile where the sidebar is off-canvas.
 */
export function SidebarHeader(props: { label: string }) {
  const isMobile = useMobile()
  const headerVisible = useScrollDirection()
  const { theme, toggleTheme } = useTheme()

  return (
    <Show when={!isMobile()}>
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: '260px',
      height: '72px',
      'z-index': '99',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'space-between',
      padding: '0 14px',
      background: headerVisible() ? 'transparent' : 'var(--color-header-bg)',
      'border-bottom': headerVisible() ? 'none' : '1px solid var(--color-bg-200)',
      'border-right': headerVisible() ? 'none' : '1px solid var(--color-border)',
      transition: 'background 0.3s ease',
      'pointer-events': headerVisible() ? 'none' : 'auto',
    }}>
      <div style={{
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        width: '100%',
        opacity: headerVisible() ? '0' : '1',
        transform: headerVisible() ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            'align-items': 'center',
            gap: '10px',
            'text-decoration': 'none',
            color: 'var(--color-text)',
          }}
        >
          <div style={{
            width: '28px',
            height: '28px',
            background: 'var(--color-accent)',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'font-weight': '700',
            color: 'var(--color-surface)',
            'font-size': '12px',
            'font-family': 'var(--font-title)',
            'clip-path': 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
            filter: 'drop-shadow(0 0 4px var(--color-accent-glow))',
          }}>
            L
          </div>
          <div>
            <div style={{ 'font-family': 'var(--font-title)', 'font-weight': '600', 'font-size': '13px' }}>LIM</div>
            <div style={{ 'font-size': '9px', color: 'var(--color-accent)', 'font-family': 'var(--font-title)', 'text-transform': 'uppercase', 'letter-spacing': '0.05em' }}>{props.label}</div>
          </div>
        </Link>

        <button
          onClick={toggleTheme}
          title={theme() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label={theme() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          class="vui-header__theme-toggle"
          style={{ width: '28px', height: '28px' }}
        >
          <Show when={theme() === 'dark'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--color-blue-300)' }} stroke-width="2.5" aria-hidden="true">
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
          <Show when={theme() !== 'dark'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--color-accent)' }} stroke-width="2.5" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </Show>
        </button>
      </div>
    </div>
    </Show>
  )
}
