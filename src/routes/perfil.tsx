import { createFileRoute, redirect } from '@tanstack/solid-router'
import { createSignal, Show } from 'solid-js'
import { Avatar } from '@proyecto-viviana/ui'
import { toastSuccess, toastError } from '@proyecto-viviana/ui/toast'
import { PageShell } from '../components/layouts/PageShell'
import { useAuth } from '../auth/context'
import type { AuthUser } from '../auth/context'
import { formatFileSize } from '../utils/format'

export const Route = createFileRoute('/perfil')({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: typeof search.returnTo === 'string' && search.returnTo.startsWith('/')
      ? search.returnTo
      : '/',
  }),
  beforeLoad: ({ context }) => {
    const user = (context as { user: AuthUser | null }).user
    if (!user) {
      throw redirect({ href: '/api/auth/google' })
    }
  },
  component: PerfilPage,
})

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/
const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2 MB

function PerfilPage() {
  const auth = useAuth()
  const search = Route.useSearch()

  const user = () => auth.user!
  const isNewUser = () => !user().username

  const [username, setUsername] = createSignal(auth.user?.username ?? '')
  const [avatarFile, setAvatarFile] = createSignal<File | null>(null)
  const [avatarPreview, setAvatarPreview] = createSignal<string | null>(null)
  const [error, setError] = createSignal('')
  const [submitting, setSubmitting] = createSignal(false)

  const usernameValid = () => USERNAME_RE.test(username())

  function handleAvatarChange(e: Event) {
    const input = e.currentTarget as HTMLInputElement
    const file = input.files?.[0] ?? null

    if (file && file.size > MAX_AVATAR_SIZE) {
      toastError('El avatar no puede superar 2 MB')
      input.value = ''
      setAvatarFile(null)
      setAvatarPreview(null)
      return
    }

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
        toastSuccess('Perfil guardado')
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
            {isNewUser() ? <>Bienvenido/a, {user().name}</> : 'Editar perfil'}
          </h1>
          <p style={{
            color: "var(--color-text-secondary)",
            "font-size": "0.875rem",
            margin: "0 0 1.5rem 0",
          }}>
            {isNewUser()
              ? 'Elegí un nombre de usuario para tu perfil.'
              : 'Modificá tu nombre de usuario o avatar.'}
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
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </label>
              <Show when={!isNewUser()}>
                <span style={{
                  "font-size": "0.75rem",
                  color: "var(--color-text-muted)",
                }}>
                  Almacenamiento: {formatFileSize(user().storageBytesUsed)} / {formatFileSize(user().storageQuotaBytes)}
                </span>
              </Show>
            </div>

            {/* Username */}
            <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem" }}>
              <span class="vui-label">Nombre de usuario *</span>
              <input
                type="text"
                value={username()}
                onInput={(e) => setUsername(e.currentTarget.value)}
                placeholder="ej: maria_lim"
                maxLength={20}
                class="vui-input"
                style={{ width: "100%" }}
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
            <button
              type="submit"
              disabled={submitting() || !usernameValid()}
              style={{
                padding: "0.625rem 1.5rem",
                background: "var(--color-accent)",
                color: "white",
                border: "none",
                "font-family": "var(--font-title)",
                "font-weight": "600",
                "font-size": "0.875rem",
                cursor: submitting() || !usernameValid() ? "not-allowed" : "pointer",
                opacity: submitting() || !usernameValid() ? "0.5" : "1",
                "clip-path": "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
              }}
            >
              {submitting() ? 'Guardando...' : 'Confirmar'}
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  )
}
