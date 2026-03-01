import { Show, type JSX } from 'solid-js'
import { AppHeader } from '../AppHeader'
import { SidebarHeader } from '../SidebarHeader'

interface PageShellProps {
  children: JSX.Element
  sidebarLabel?: string
  class?: string
}

export function PageShell(props: PageShellProps) {
  return (
    <div
      class={props.class}
      style={props.class ? undefined : {
        "min-height": "100vh",
        background: "var(--color-background)",
        "font-family": "var(--font-body)",
        color: "var(--color-text)",
      }}
    >
      <AppHeader />
      <Show when={props.sidebarLabel}>
        <SidebarHeader label={props.sidebarLabel!} />
      </Show>
      {props.children}
    </div>
  )
}
