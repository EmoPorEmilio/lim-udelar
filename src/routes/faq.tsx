import { createFileRoute } from '@tanstack/solid-router'
import { For } from 'solid-js'
import { faqItems } from '../data/faq'
import { PageShell } from '../components/layouts/PageShell'
import { SidebarLayout } from '../components/layouts/SidebarLayout'
import { SidebarNavItem, SidebarLabel } from '../components/layouts/SidebarNavItem'
import { SidebarCta } from '../components/layouts/SidebarCta'
import { SectionHeading } from '../components/layouts/SectionHeading'
import { ContentFooter } from '../components/layouts/ContentFooter'

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

const sectionIds = faqItems.map((_, i) => `faq-${i}`)

function FaqPage() {
  return (
    <PageShell sidebarLabel="Preguntas Frecuentes">
      <SidebarLayout
        sectionIds={sectionIds}
        sidebar={(activeSection, scrollTo) => <>
          <SidebarLabel text="Preguntas Frecuentes" />
          <div style={{ flex: "1", "overflow-y": "auto", padding: "4px 0" }}>
            <For each={faqItems}>
              {(_, i) => {
                const id = `faq-${i()}`
                return (
                  <SidebarNavItem
                    id={id}
                    label={sidebarLabels[i()] || faqItems[i()].question}
                    active={activeSection() === id}
                    onClick={scrollTo}
                  />
                )
              }}
            </For>
          </div>
          <SidebarCta href="/curriculum" label="Ver Plan de Estudios" />
        </>}
      >
        <For each={faqItems}>
          {(item, i) => (
            <section
              id={`faq-${i()}`}
              style={{ "margin-bottom": "2.5rem", "scroll-margin-top": "5rem" }}
            >
              <SectionHeading>{item.question}</SectionHeading>
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
        <ContentFooter />
      </SidebarLayout>
    </PageShell>
  )
}
