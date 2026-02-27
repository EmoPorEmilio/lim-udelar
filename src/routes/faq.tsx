import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, For, onMount, onCleanup } from 'solid-js'
import { isServer } from 'solid-js/web'
import { AppHeader } from '../components/AppHeader'
import { faqItems } from '../data/faq'

export const Route = createFileRoute('/faq')({
  component: FaqPage,
})

/* Short labels for sidebar nav */
const sidebarLabels = [
  '¿Qué es la LIM?',
  'Duración',
  'Áreas de formación',
  'Requisitos de ingreso',
  'Primera generación',
  'Trabajo Final',
  'Salidas laborales',
  'Contacto',
  'Proyectos',
  'Investigación',
]

function FaqPage() {
  const [activeSection, setActiveSection] = createSignal('faq-0')
  const [sidebarOpen, setSidebarOpen] = createSignal(false)

  function scrollTo(id: string) {
    if (isServer) return
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
      setSidebarOpen(false)
    }
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    for (let i = 0; i < faqItems.length; i++) {
      const el = document.getElementById(`faq-${i}`)
      if (el) observer.observe(el)
    }

    onCleanup(() => observer.disconnect())
  })

  return (
    <div style={{
      "min-height": "100vh",
      background: "var(--color-background)",
      "font-family": "var(--font-body)",
      color: "var(--color-text)",
    }}>
      <AppHeader />

      <div style={{ display: "flex", "min-height": "calc(100vh - 72px)" }}>
        {/* Sidebar */}
        <nav style={{
          width: "260px",
          "min-width": "260px",
          height: "calc(100vh - 72px)",
          position: "sticky",
          top: "72px",
          background: "var(--color-surface-elevated)",
          "border-right": "1px solid var(--color-border)",
          display: "flex",
          "flex-direction": "column",
          "overflow-y": "auto",
        }}>
          <div style={{
            padding: "16px 14px 8px",
            "font-family": "var(--font-title)",
            "font-size": "11px",
            "font-weight": "600",
            "text-transform": "uppercase",
            "letter-spacing": "0.1em",
            color: "var(--color-accent)",
          }}>
            Preguntas Frecuentes
          </div>

          <div style={{ flex: "1", "overflow-y": "auto", padding: "4px 0" }}>
            <For each={faqItems}>
              {(_, i) => {
                const id = `faq-${i()}`
                return (
                  <button
                    onClick={() => scrollTo(id)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 14px",
                      "text-align": "left",
                      background: activeSection() === id ? "var(--color-accent)" : "transparent",
                      border: "none",
                      "border-left": activeSection() === id
                        ? "3px solid var(--color-accent)"
                        : "3px solid transparent",
                      color: activeSection() === id ? "var(--color-surface)" : "var(--color-text-secondary)",
                      "font-family": "var(--font-body)",
                      "font-size": "12px",
                      "font-weight": activeSection() === id ? "600" : "400",
                      cursor: "pointer",
                      transition: "all 0.1s",
                    }}
                  >
                    {sidebarLabels[i()] || faqItems[i()].question}
                  </button>
                )
              }}
            </For>
          </div>

          {/* Sidebar footer CTA */}
          <div style={{ padding: "12px" }}>
            <a
              href="/curriculum"
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                gap: "8px",
                padding: "10px 14px",
                background: "var(--color-primary-500)",
                color: "var(--color-surface)",
                "text-decoration": "none",
                "font-weight": "600",
                "font-size": "12px",
                "font-family": "var(--font-body)",
                border: "2px solid var(--color-primary-500)",
                "clip-path": "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
                filter: "drop-shadow(0 0 4px color-mix(in srgb, var(--color-primary-500) 40%, transparent))",
                transition: "filter 0.2s ease",
              }}
            >
              Ver Plan de Estudios
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </nav>

        {/* Main content */}
        <main style={{
          flex: "1",
          padding: "32px 48px",
          "max-width": "800px",
          "min-width": "0",
        }}>
          <For each={faqItems}>
            {(item, i) => (
              <section
                id={`faq-${i()}`}
                style={{
                  "margin-bottom": "2.5rem",
                  "scroll-margin-top": "5rem",
                }}
              >
                <h2 style={{
                  "font-family": "var(--font-title)",
                  "font-size": "20px",
                  "font-weight": "600",
                  margin: "0 0 16px 0",
                  "padding-bottom": "10px",
                  "padding-left": "12px",
                  "border-left": "3px solid var(--color-accent)",
                  "border-bottom": "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
                  "letter-spacing": "-0.01em",
                  color: "var(--color-text)",
                  filter: "drop-shadow(0 0 4px color-mix(in srgb, var(--color-accent) 30%, transparent))",
                }}>
                  {item.question}
                </h2>
                <div style={{
                  "line-height": "1.6",
                  "font-size": "14px",
                  color: "var(--color-text-secondary)",
                  "padding-left": "12px",
                }}>
                  <p style={{ margin: "0" }}>{item.answer}</p>
                </div>
              </section>
            )}
          </For>

          {/* Footer */}
          <div style={{
            "margin-top": "2rem",
            "padding-top": "16px",
            "border-top": "1px solid var(--color-border)",
            "text-align": "center",
          }}>
            <p style={{
              "font-weight": "600",
              margin: "0",
              "font-size": "12px",
              color: "var(--color-text-secondary)",
            }}>
              LIM — Grupo de Estudio
            </p>
            <p style={{
              "margin-top": "8px",
              "font-size": "11px",
              color: "var(--color-text-muted)",
            }}>
              <span style={{ color: "var(--color-accent)" }}>FIC</span>
              {' + '}
              <span style={{ color: "var(--color-primary-400)" }}>Fing</span>
              {' — Universidad de la República — Uruguay'}
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
