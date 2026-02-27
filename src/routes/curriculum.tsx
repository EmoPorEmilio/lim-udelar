import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, For, onMount, onCleanup } from 'solid-js'
import { isServer } from 'solid-js/web'
import { AppHeader } from '../components/AppHeader'
import { trainingAreas, semesters, professionalAreas } from '../data/curriculum'

export const Route = createFileRoute('/curriculum')({
  component: CurriculumPage,
})

const areaColor: Record<string, string> = {
  ING: 'var(--color-primary-400)',
  ICM: 'var(--color-accent)',
  CI: 'var(--color-success)',
  COMP: 'var(--color-warning)',
}

const areaBg: Record<string, string> = {
  ING: 'color-mix(in srgb, var(--color-primary-400) 15%, transparent)',
  ICM: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
  CI: 'color-mix(in srgb, var(--color-success) 15%, transparent)',
  COMP: 'color-mix(in srgb, var(--color-warning) 15%, transparent)',
}

const areaBorder: Record<string, string> = {
  ING: 'color-mix(in srgb, var(--color-primary-400) 40%, transparent)',
  ICM: 'color-mix(in srgb, var(--color-accent) 40%, transparent)',
  CI: 'color-mix(in srgb, var(--color-success) 40%, transparent)',
  COMP: 'color-mix(in srgb, var(--color-warning) 40%, transparent)',
}

/* All section IDs for intersection observer */
const sectionIds = [
  'areas',
  ...semesters.map((_, i) => `sem-${i + 1}`),
  'perfil',
]

function CurriculumPage() {
  const [activeSection, setActiveSection] = createSignal('areas')

  function scrollTo(id: string) {
    if (isServer) return
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
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

    for (const id of sectionIds) {
      const el = document.getElementById(id)
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
          {/* Section: Áreas */}
          <div style={{
            padding: "16px 14px 4px",
            "font-family": "var(--font-title)",
            "font-size": "11px",
            "font-weight": "600",
            "text-transform": "uppercase",
            "letter-spacing": "0.1em",
            color: "var(--color-accent)",
          }}>
            Plan de Estudios
          </div>

          <div style={{ flex: "1", "overflow-y": "auto", padding: "4px 0" }}>
            {/* Areas link */}
            <button
              onClick={() => scrollTo('areas')}
              style={{
                display: "block",
                width: "100%",
                padding: "8px 14px",
                "text-align": "left",
                background: activeSection() === 'areas' ? "var(--color-accent)" : "transparent",
                border: "none",
                "border-left": activeSection() === 'areas'
                  ? "3px solid var(--color-accent)"
                  : "3px solid transparent",
                color: activeSection() === 'areas' ? "var(--color-surface)" : "var(--color-text-secondary)",
                "font-family": "var(--font-body)",
                "font-size": "12px",
                "font-weight": activeSection() === 'areas' ? "600" : "400",
                cursor: "pointer",
                transition: "all 0.1s",
              }}
            >
              Áreas de Formación
            </button>

            {/* Semester divider */}
            <div style={{
              padding: "12px 14px 4px",
              "font-family": "var(--font-title)",
              "font-size": "10px",
              "font-weight": "600",
              "text-transform": "uppercase",
              "letter-spacing": "0.1em",
              color: "var(--color-text-muted)",
            }}>
              Semestres
            </div>

            <For each={semesters}>
              {(sem) => {
                const id = `sem-${sem.number}`
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
                    Semestre {sem.number}
                  </button>
                )
              }}
            </For>

            {/* Perfil link */}
            <div style={{
              padding: "12px 14px 4px",
              "font-family": "var(--font-title)",
              "font-size": "10px",
              "font-weight": "600",
              "text-transform": "uppercase",
              "letter-spacing": "0.1em",
              color: "var(--color-text-muted)",
            }}>
              Egreso
            </div>

            <button
              onClick={() => scrollTo('perfil')}
              style={{
                display: "block",
                width: "100%",
                padding: "8px 14px",
                "text-align": "left",
                background: activeSection() === 'perfil' ? "var(--color-accent)" : "transparent",
                border: "none",
                "border-left": activeSection() === 'perfil'
                  ? "3px solid var(--color-accent)"
                  : "3px solid transparent",
                color: activeSection() === 'perfil' ? "var(--color-surface)" : "var(--color-text-secondary)",
                "font-family": "var(--font-body)",
                "font-size": "12px",
                "font-weight": activeSection() === 'perfil' ? "600" : "400",
                cursor: "pointer",
                transition: "all 0.1s",
              }}
            >
              Perfil Profesional
            </button>
          </div>

          {/* Sidebar footer CTA */}
          <div style={{ padding: "12px" }}>
            <a
              href="/faq"
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
              Preguntas Frecuentes
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
          {/* Training Areas Section */}
          <section id="areas" style={{ "margin-bottom": "2.5rem", "scroll-margin-top": "5rem" }}>
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
              Áreas de Formación
            </h2>
            <p style={{
              "font-size": "14px",
              color: "var(--color-text-secondary)",
              "line-height": "1.6",
              margin: "0 0 16px 0",
              "padding-left": "12px",
            }}>
              4 áreas de formación, 8 semestres, 360 créditos.
            </p>

            <div style={{
              display: "flex",
              "flex-direction": "column",
              gap: "0",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              margin: "12px 0",
            }}>
              <For each={trainingAreas}>
                {(area) => (
                  <div style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "12px",
                    "font-size": "13px",
                    padding: "10px 12px",
                    "border-bottom": "1px solid var(--color-border)",
                  }}>
                    <code style={{
                      background: areaBg[area.code],
                      color: areaColor[area.code],
                      padding: "3px 8px",
                      "font-family": "var(--font-mono)",
                      "font-size": "12px",
                      "font-weight": "500",
                      "min-width": "50px",
                      "text-align": "center",
                      border: `1px solid ${areaBorder[area.code]}`,
                      "clip-path": "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                    }}>
                      {area.code}
                    </code>
                    <span style={{ "font-weight": "500", color: "var(--color-text)" }}>
                      {area.name}
                    </span>
                    <span style={{ color: "var(--color-text-secondary)", "font-size": "11px", flex: "1" }}>
                      {area.description}
                    </span>
                  </div>
                )}
              </For>
            </div>
          </section>

          {/* Semester Sections */}
          <For each={semesters}>
            {(sem) => (
              <section id={`sem-${sem.number}`} style={{ "margin-bottom": "2.5rem", "scroll-margin-top": "5rem" }}>
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
                  Semestre {sem.number}
                </h2>

                {/* Subject table */}
                <div style={{
                  display: "flex",
                  "flex-direction": "column",
                  gap: "0",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  margin: "12px 0",
                }}>
                  <For each={sem.subjects}>
                    {(subject) => (
                      <div style={{
                        display: "flex",
                        "flex-wrap": "wrap",
                        "align-items": "center",
                        gap: "12px",
                        "font-size": "13px",
                        padding: "8px 12px",
                        "border-bottom": "1px solid var(--color-border)",
                      }}>
                        <code style={{
                          background: areaBg[subject.areaCode],
                          color: areaColor[subject.areaCode],
                          padding: "3px 8px",
                          "font-family": "var(--font-mono)",
                          "font-size": "12px",
                          "font-weight": "500",
                          "min-width": "70px",
                          "text-align": "center",
                          border: `1px solid ${areaBorder[subject.areaCode]}`,
                          "clip-path": "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                        }}>
                          {subject.code}
                        </code>
                        <span style={{ "font-weight": "500", color: "var(--color-text)", flex: "1" }}>
                          {subject.name}
                        </span>
                        <span style={{
                          color: "var(--color-text-muted)",
                          "font-size": "11px",
                          "font-family": "var(--font-title)",
                        }}>
                          {subject.credits} cr
                        </span>
                      </div>
                    )}
                  </For>
                </div>
              </section>
            )}
          </For>

          {/* Professional Areas Section */}
          <section id="perfil" style={{ "margin-bottom": "2.5rem", "scroll-margin-top": "5rem" }}>
            <h2 style={{
              "font-family": "var(--font-title)",
              "font-size": "20px",
              "font-weight": "600",
              margin: "0 0 16px 0",
              "padding-bottom": "10px",
              "padding-left": "12px",
              "border-left": "3px solid var(--color-primary-400)",
              "border-bottom": "1px solid color-mix(in srgb, var(--color-primary-400) 25%, transparent)",
              "letter-spacing": "-0.01em",
              color: "var(--color-text)",
              filter: "drop-shadow(0 0 4px color-mix(in srgb, var(--color-primary-400) 30%, transparent))",
            }}>
              Perfil Profesional
            </h2>
            <p style={{
              "font-size": "14px",
              color: "var(--color-text-secondary)",
              "line-height": "1.6",
              margin: "0 0 16px 0",
              "padding-left": "12px",
            }}>
              Áreas de desempeño profesional para egresados de la LIM.
            </p>

            <div style={{
              display: "grid",
              "grid-template-columns": "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "8px",
              margin: "12px 0",
            }}>
              <For each={professionalAreas}>
                {(area) => (
                  <div style={{
                    background: "var(--color-surface)",
                    border: "1px solid color-mix(in srgb, var(--color-primary-400) 40%, transparent)",
                    padding: "10px 8px",
                    "clip-path": "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    transition: "all 0.15s ease",
                  }}>
                    <span style={{
                      display: "block",
                      "font-size": "13px",
                      color: "var(--color-primary-400)",
                      "font-family": "var(--font-title)",
                      "font-weight": "600",
                      "margin-bottom": "4px",
                    }}>
                      {area.name}
                    </span>
                    <span style={{
                      "font-size": "11px",
                      color: "var(--color-text-secondary)",
                    }}>
                      {area.description}
                    </span>
                  </div>
                )}
              </For>
            </div>
          </section>

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
