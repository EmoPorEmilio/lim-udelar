import { createFileRoute } from '@tanstack/solid-router'
import { For } from 'solid-js'
import { trainingAreas, semesters, professionalAreas } from '../data/curriculum'
import { PageShell } from '../components/layouts/PageShell'
import { SidebarLayout } from '../components/layouts/SidebarLayout'
import { SidebarNavItem, SidebarLabel } from '../components/layouts/SidebarNavItem'
import { SidebarCta } from '../components/layouts/SidebarCta'
import { SectionHeading } from '../components/layouts/SectionHeading'
import { ContentFooter } from '../components/layouts/ContentFooter'

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

const sectionIds = [
  'areas',
  ...semesters.map((_, i) => `sem-${i + 1}`),
  'perfil',
]

function CurriculumPage() {
  return (
    <PageShell sidebarLabel="Plan de Estudios">
      <SidebarLayout
        sectionIds={sectionIds}
        sidebar={(activeSection, scrollTo) => <>
          <SidebarLabel text="Plan de Estudios" />
          <div style={{ flex: "1", "overflow-y": "auto", padding: "4px 0" }}>
            <SidebarNavItem
              id="areas"
              label="Áreas de Formación"
              active={activeSection() === 'areas'}
              onClick={scrollTo}
            />

            <SidebarLabel text="Semestres" muted />
            <For each={semesters}>
              {(sem) => {
                const id = `sem-${sem.number}`
                return (
                  <SidebarNavItem
                    id={id}
                    label={`Semestre ${sem.number}`}
                    active={activeSection() === id}
                    onClick={scrollTo}
                  />
                )
              }}
            </For>

            <SidebarLabel text="Egreso" muted />
            <SidebarNavItem
              id="perfil"
              label="Perfil Profesional"
              active={activeSection() === 'perfil'}
              onClick={scrollTo}
            />
          </div>
          <SidebarCta href="/faq" label="Preguntas Frecuentes" />
        </>}
      >
        {/* Training Areas Section */}
        <section id="areas" style={{ "margin-bottom": "2.5rem", "scroll-margin-top": "5rem" }}>
          <SectionHeading>Áreas de Formación</SectionHeading>
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
              <SectionHeading>Semestre {sem.number}</SectionHeading>

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
          <SectionHeading color="var(--color-primary-400)">Perfil Profesional</SectionHeading>
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

        <ContentFooter />
      </SidebarLayout>
    </PageShell>
  )
}
