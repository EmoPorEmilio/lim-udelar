import type { JSX } from 'solid-js'

interface SectionHeadingProps {
  children: JSX.Element
  color?: string
}

export function SectionHeading(props: SectionHeadingProps) {
  const color = () => props.color ?? 'var(--color-accent)'

  return (
    <h2 style={{
      "font-family": "var(--font-title)",
      "font-size": "20px",
      "font-weight": "600",
      margin: "0 0 16px 0",
      "padding-bottom": "10px",
      "padding-left": "12px",
      "border-left": `3px solid ${color()}`,
      "border-bottom": `1px solid color-mix(in srgb, ${color()} 25%, transparent)`,
      "letter-spacing": "-0.01em",
      color: "var(--color-text)",
      filter: `drop-shadow(0 0 4px color-mix(in srgb, ${color()} 30%, transparent))`,
    }}>
      {props.children}
    </h2>
  )
}
