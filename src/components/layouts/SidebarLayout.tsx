import { createSignal, onMount, onCleanup, type JSX, type Accessor } from 'solid-js'
import { isServer } from 'solid-js/web'

interface SidebarLayoutProps {
  sectionIds: string[]
  sidebar: (activeSection: Accessor<string>, scrollTo: (id: string) => void) => JSX.Element
  children: JSX.Element
}

export function SidebarLayout(props: SidebarLayoutProps) {
  const [activeSection, setActiveSection] = createSignal(props.sectionIds[0] ?? '')

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
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    )

    for (const id of props.sectionIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    onCleanup(() => observer.disconnect())
  })

  return (
    <div style={{ display: "flex", "min-height": "calc(100vh - 72px)" }}>
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
        {props.sidebar(activeSection, scrollTo)}
      </nav>

      <main style={{
        flex: "1",
        padding: "32px 48px",
        "max-width": "800px",
        "min-width": "0",
      }}>
        {props.children}
      </main>
    </div>
  )
}
