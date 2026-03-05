import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/solid-router'
import type { ErrorComponentProps } from '@tanstack/solid-router'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  })

  console.error('DefaultCatchBoundary Error:', error)

  return (
    <div style={{
      'min-width': '0',
      flex: '1',
      padding: '2rem',
      display: 'flex',
      'flex-direction': 'column',
      'align-items': 'center',
      'justify-content': 'center',
      gap: '1.5rem',
    }}>
      <ErrorComponent error={error} />
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        'align-items': 'center',
        'flex-wrap': 'wrap',
      }}>
        <button
          onClick={() => {
            router.invalidate()
          }}
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
          Reintentar
        </button>
        {isRoot() ? (
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
        ) : (
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
            onClick={(e) => {
              e.preventDefault()
              window.history.back()
            }}
          >
            Volver
          </Link>
        )}
      </div>
    </div>
  )
}
