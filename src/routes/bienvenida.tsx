import { createFileRoute, redirect } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js'
import { Button, Avatar } from '@proyecto-viviana/ui'
import { PageShell } from '../components/layouts/PageShell'
import { useAuth } from '../auth/context'

export const Route = createFileRoute('/bienvenida')({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: typeof search.returnTo === 'string' && search.returnTo.startsWith('/')
      ? search.returnTo
      : '/',
  }),
  beforeLoad: ({ context }) => {
    const user = (context as any).user
    if (!user) {
      throw redirect({ href: '/api/auth/google' })
    }
    if (user.username) {
      throw redirect({ to: '/' })
    }
  },
  component: BienvenidaPage,
})

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

const inputStyle = {
  padding: "0.5rem 1rem",
  background: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  "font-family": "var(--font-body)",
  "clip-path": "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
  width: "100%",
} as const

const labelStyle = {
  color: "var(--color-text-secondary)",
  "font-size": "0.875rem",
  "font-family": "var(--font-title)",
} as const

function BienvenidaPage() {
  const auth = useAuth()
  const search = Route.useSearch()

  const [username, setUsername] = createSignal('')
  const [avatarFile, setAvatarFile] = createSignal<File | null>(null)
  const [avatarPreview, setAvatarPreview] = createSignal<string | null>(null)
  const [error, setError] = createSignal('')
  const [submitting, setSubmitting] = createSignal(false)

  const usernameValid = () => USERNAME_RE.test(username())

  function handleAvatarChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const file = input.files?.[0] ?? null
    setAvatarFile(file)

    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
    } else {
      setAvatarPreview(null)
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    setError('')

    if (!usernameValid()) {
      setError('El nombre de usuario debe tener entre 3 y 20 caracteres (letras, números o _)')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.set('username', username())
      const file = avatarFile()
      if (file) {
        formData.set('avatar', file)
      }

      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        window.location.href = search().returnTo
      } else {
        const data: { error?: string } = await res.json()
        setError(data.error || 'Error al guardar el perfil')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const user = () => auth.user!
  const displayAvatar = () => avatarPreview() || user().avatarUrl || undefined

  return (
    <PageShell class="vui-page vui-page--with-header">
      <section style={{
        flex: "1",
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
        padding: "2rem",
      }}>
        <div style={{
          width: "100%",
          "max-width": "420px",
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
          padding: "2rem",
          "clip-path": "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
        }}>
          <h1 style={{
            "font-family": "var(--font-title)",
            "font-size": "1.5rem",
            "font-weight": "700",
            margin: "0 0 0.5rem 0",
          }}>
            Bienvenido/a, {user().name}
          </h1>
          <p style={{
            color: "var(--color-text-secondary)",
            "font-size": "0.875rem",
            margin: "0 0 1.5rem 0",
          }}>
            Elegí un nombre de usuario para tu perfil.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", "flex-direction": "column", gap: "1.25rem" }}>
            {/* Avatar */}
            <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
              <Avatar
                src={displayAvatar()}
                alt={user().name}
                fallback={user().name.charAt(0)}
                size="lg"
              />
              <label style={{ cursor: "pointer", display: "inline-block" }}>
                <span style={{
                  display: "inline-block",
                  padding: "0.25rem 0.75rem",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  "font-family": "var(--font-title)",
                  "font-size": "0.875rem",
                  cursor: "pointer",
                  "clip-path": "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
                }}>
                  Cambiar avatar
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* Username */}
            <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
              <span style={labelStyle}>Nombre de usuario *</span>
              <input
                type="text"
                value={username()}
                onInput={(e) => setUsername(e.currentTarget.value)}
                placeholder="ej: maria_lim"
                maxLength={20}
                style={inputStyle}
              />
              <Show when={username().length > 0 && !usernameValid()}>
                <span style={{ color: "var(--color-danger, #ef4444)", "font-size": "0.75rem" }}>
                  3-20 caracteres: letras, números o _
                </span>
              </Show>
            </label>

            {/* Error */}
            <Show when={error()}>
              <div style={{
                padding: "0.5rem 0.75rem",
                background: "color-mix(in srgb, var(--color-danger, #ef4444) 10%, transparent)",
                border: "1px solid var(--color-danger, #ef4444)",
                color: "var(--color-danger, #ef4444)",
                "font-size": "0.875rem",
                "clip-path": "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
              }}>
                {error()}
              </div>
            </Show>

            {/* Submit */}
            <Button
              type="submit"
              variant="accent"
              isDisabled={submitting() || !usernameValid()}
            >
              {submitting() ? 'Guardando...' : 'Confirmar'}
            </Button>
          </form>
        </div>
      </section>
    </PageShell>
  )
}
