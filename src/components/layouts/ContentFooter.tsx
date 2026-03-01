export function ContentFooter() {
  return (
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
  )
}
