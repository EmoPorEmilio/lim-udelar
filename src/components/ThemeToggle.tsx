import { Show } from 'solid-js'

export function ThemeToggle(props: { isDark: boolean; onToggle: () => void; size?: number }) {
  const size = () => props.size ?? 16

  return (
    <button
      onClick={props.onToggle}
      title={props.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={props.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      class="vui-header__theme-toggle"
    >
      <Show when={props.isDark}>
        <svg width={size()} height={size()} viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{ stroke: 'var(--color-blue-300)' }} aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </Show>
      <Show when={!props.isDark}>
        <svg width={size()} height={size()} viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{ stroke: 'var(--color-accent)' }} aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </Show>
    </button>
  )
}
