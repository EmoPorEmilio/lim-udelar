import { createSignal, onMount, onCleanup, Show, type JSX, type Accessor } from 'solid-js'
import { isServer } from 'solid-js/web'
import { useMobile } from '../../hooks/useMobile'

interface SidebarLayoutProps {
  sectionIds: string[]
  sidebar: (activeSection: Accessor<string>, scrollTo: (id: string) => void) => JSX.Element
  children: JSX.Element
}

export function SidebarLayout(props: SidebarLayoutProps) {
  const [activeSection, setActiveSection] = createSignal(props.sectionIds[0] ?? '')
  const [sidebarOpen, setSidebarOpen] = createSignal(false)
  const isMobile = useMobile()

  function scrollTo(id: string) {
    if (isServer) return
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
    }
    if (isMobile()) setSidebarOpen(false)
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
      {/* Mobile: floating sidebar toggle button */}
      <Show when={isMobile() && !sidebarOpen()}>
        <button
          onClick={() => setSidebarOpen(true)}
          aria-expanded={false}
          aria-label="Abrir navegación"
          class="vui-header__theme-toggle"
          style={{
            position: 'fixed',
            top: '80px',
            left: '12px',
            'z-index': '140',
            width: '36px',
            height: '36px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" style={{ stroke: 'var(--color-text)' }} aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </Show>

      {/* Mobile: dark overlay */}
      <Show when={isMobile() && sidebarOpen()}>
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: '0',
            background: 'rgba(0,0,0,0.8)',
            'z-index': '150',
          }}
        />
      </Show>

      {/* Sidebar nav */}
      <nav style={{
        width: "280px",
        "min-width": "280px",
        height: isMobile() ? "100vh" : "calc(100vh - 72px)",
        position: "fixed",
        top: isMobile() ? "0" : "72px",
        left: isMobile() ? (sidebarOpen() ? "0" : "-280px") : "0",
        'z-index': isMobile() ? '160' : 'auto',
        background: "var(--color-surface-elevated)",
        "border-right": "1px solid var(--color-border)",
        display: "flex",
        "flex-direction": "column",
        "overflow-y": "auto",
        transition: isMobile() ? "left 0.2s ease" : "none",
      }}>
        {props.sidebar(activeSection, scrollTo)}
      </nav>

      {/* Desktop spacer to offset the fixed sidebar */}
      <Show when={!isMobile()}>
        <div style={{ width: "280px", "min-width": "280px" }} />
      </Show>

      <main style={{
        flex: "1",
        padding: isMobile() ? "24px 16px" : "32px 48px",
        "max-width": "800px",
        "min-width": "0",
      }}>
        {props.children}
      </main>
    </div>
  )
}
