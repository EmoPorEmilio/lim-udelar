import { createFileRoute, Link, useLocation } from '@tanstack/solid-router'
import { Show } from 'solid-js'
import { Logo, Button } from '@proyecto-viviana/ui'
import { PageShell } from '../components/layouts/PageShell'
import { useAuth } from '../auth/context'
import { useMobile } from '../hooks/useMobile'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const auth = useAuth()
  const location = useLocation()
  const isMobile = useMobile()
  const loginUrl = () => `/api/auth/google?returnTo=${encodeURIComponent(location().pathname)}`

  return (
    <PageShell class="vui-landing">

      {/* Hero — full height, centered */}
      <main style={{
        flex: '1',
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        'justify-content': 'center',
        padding: isMobile() ? '3rem 1rem' : '4rem 2rem',
        'text-align': 'center',
      }}>
        {/* Tag */}
        <div class="vui-hero__tag">LICENCIATURA EN INGENIERÍA DE MEDIOS</div>

        {/* Logo */}
        <div style={{ "margin-bottom": "1.5rem" }}>
          <Logo firstWord="LIM" secondWord="Medios" />
        </div>

        {/* Title */}
        <h1 style={{
          'font-family': 'var(--font-title)',
          'font-size': 'clamp(2.5rem, 8vw, 5rem)',
          'font-weight': '700',
          'line-height': '1',
          margin: '0 0 1.5rem 0',
          'letter-spacing': '-0.02em',
        }}>
          Grupo de <span class="vui-gradient-text">Estudio</span>
        </h1>

        {/* Subtitle with accent bar */}
        <p style={{
          'font-size': '14px',
          'max-width': '420px',
          'line-height': '1.6',
          margin: '0 0 2rem 0',
          color: 'var(--color-text-secondary)',
          'border-left': '3px solid var(--color-accent)',
          'padding-left': '12px',
          'text-align': 'left',
        }}>
          Plataforma colaborativa para estudiantes de la LIM.
          Compartí materiales, explorá el plan de estudios y conectá con tus compañeros.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px', 'flex-wrap': 'wrap', 'justify-content': 'center' }}>
          <Show
            when={auth.user}
            fallback={
              <a href={loginUrl()} style={{ 'text-decoration': 'none' }}>
                <Button variant="accent">Ingresar con Google</Button>
              </a>
            }
          >
            <Link to="/materiales" style={{ 'text-decoration': 'none' }}>
              <Button variant="accent">Ir a Materiales</Button>
            </Link>
          </Show>
          <Link to="/curriculum" style={{ 'text-decoration': 'none' }}>
            <Button variant="primary" buttonStyle="outline">Ver Plan de Estudios</Button>
          </Link>
        </div>

        {/* Feature blocks */}
        <div style={{
          display: 'grid',
          'grid-template-columns': 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '8px',
          'margin-top': '3rem',
          'max-width': '600px',
          width: '100%',
        }}>
          <FeatureBlock
            title="Materiales"
            desc="Apuntes y recursos compartidos"
            color="var(--color-accent)"
          />
          <FeatureBlock
            title="Plan Curricular"
            desc="8 semestres, 4 áreas"
            color="var(--color-primary-300)"
          />
          <FeatureBlock
            title="FAQ"
            desc="Todo sobre la carrera"
            color="var(--color-accent)"
          />
        </div>
      </main>

      {/* Thin footer bar */}
      <footer style={{
        display: 'flex',
        'justify-content': 'space-between',
        'align-items': 'center',
        height: '32px',
        padding: '0 24px',
        'border-top': '1px solid var(--color-border)',
        background: 'var(--color-surface-elevated)',
        color: 'var(--color-text-secondary)',
        'flex-wrap': 'wrap',
        'font-size': '11px',
      }}>
        <span style={{ 'font-weight': '600', color: 'var(--color-text)' }}>
          LIM — Ingeniería de Medios
        </span>
        <div style={{ display: 'flex', gap: '16px', 'font-size': '10px' }}>
          <span style={{ color: 'var(--color-primary-300)' }}>FIC</span>
          <span style={{ color: 'var(--color-accent)' }}>Fing</span>
          <span style={{ color: 'var(--color-primary-300)' }}>Udelar</span>
        </div>
      </footer>
    </PageShell>
  )
}

function FeatureBlock(props: { title: string; desc: string; color: string }) {
  return (
    <div style={{
      display: 'flex',
      'align-items': 'flex-start',
      gap: '10px',
      padding: '12px',
      background: 'var(--color-surface-elevated)',
      border: `2px solid color-mix(in srgb, ${props.color} 25%, transparent)`,
      'clip-path': 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
    }}>
      <div style={{
        width: '3px',
        height: '32px',
        background: props.color,
        'flex-shrink': '0',
      }} />
      <div>
        <div style={{
          'font-family': 'var(--font-title)',
          'font-weight': '600',
          'font-size': '13px',
          'margin-bottom': '2px',
        }}>
          {props.title}
        </div>
        <div style={{
          'font-size': '11px',
          opacity: '0.7',
        }}>
          {props.desc}
        </div>
      </div>
    </div>
  )
}
