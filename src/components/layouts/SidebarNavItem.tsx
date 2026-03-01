interface SidebarNavItemProps {
  id: string
  label: string
  active: boolean
  onClick: (id: string) => void
}

export function SidebarNavItem(props: SidebarNavItemProps) {
  return (
    <button
      onClick={() => props.onClick(props.id)}
      style={{
        display: "block",
        width: "100%",
        padding: "8px 14px",
        "text-align": "left",
        background: props.active ? "var(--color-accent)" : "transparent",
        border: "none",
        "border-left": props.active
          ? "3px solid var(--color-accent)"
          : "3px solid transparent",
        color: props.active ? "var(--color-surface)" : "var(--color-text-secondary)",
        "font-family": "var(--font-body)",
        "font-size": "12px",
        "font-weight": props.active ? "600" : "400",
        cursor: "pointer",
        transition: "all 0.1s",
      }}
    >
      {props.label}
    </button>
  )
}

interface SidebarLabelProps {
  text: string
  muted?: boolean
}

export function SidebarLabel(props: SidebarLabelProps) {
  return (
    <div style={{
      padding: props.muted ? "12px 14px 4px" : "16px 14px 8px",
      "font-family": "var(--font-title)",
      "font-size": props.muted ? "10px" : "11px",
      "font-weight": "600",
      "text-transform": "uppercase",
      "letter-spacing": "0.1em",
      color: props.muted ? "var(--color-text-muted)" : "var(--color-accent)",
    }}>
      {props.text}
    </div>
  )
}
