import { Link } from '@tanstack/solid-router'
import type { JSX } from 'solid-js'

export function NotFound({ children }: { children?: JSX.Element }) {
  return (
    <div style={{
      display: 'flex',
      'flex-direction': 'column',
      'align-items': 'center',
      'justify-content': 'center',
      gap: '1rem',
      padding: '2rem',
      flex: '1',
    }}>
      <div style={{ color: 'var(--color-text-secondary)' }}>
        {children || <p>La página que buscas no existe.</p>}
      </div>
      <div style={{
        display: 'flex',
        'align-items': 'center',
        gap: '0.75rem',
        'flex-wrap': 'wrap',
      }}>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '0.375rem 0.75rem',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            'font-family': 'var(--font-title)',
            'font-weight': '700',
            'font-size': '0.75rem',
            'text-transform': 'uppercase',
            cursor: 'pointer',
            'clip-path': 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
          }}
        >
          Volver
        </button>
        <Link
          to="/"
          style={{
            padding: '0.375rem 0.75rem',
            background: 'var(--color-accent)',
            color: 'white',
            'text-decoration': 'none',
            'font-family': 'var(--font-title)',
            'font-weight': '700',
            'font-size': '0.75rem',
            'text-transform': 'uppercase',
            'clip-path': 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
          }}
        >
          Inicio
        </Link>
      </div>
    </div>
  )
}
