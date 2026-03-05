import { Link } from '@tanstack/solid-router'

interface SidebarCtaProps {
  href: string
  label: string
}

export function SidebarCta(props: SidebarCtaProps) {
  return (
    <div style={{ padding: "12px" }}>
      <Link
        to={props.href}
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
        {props.label}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}
