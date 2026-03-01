import { Show } from 'solid-js'
import { Button, Avatar } from '@proyecto-viviana/ui'
import { useAuth } from '../auth/context'

export function AuthButton() {
  const auth = useAuth()

  return (
    <Show
      when={auth.user}
      fallback={
        <a href="/api/auth/google">
          <Button variant="accent" size="sm">
            Ingresar con Google
          </Button>
        </a>
      }
    >
      {(user) => (
        <div style={{ "display": "flex", "align-items": "center", "gap": "0.75rem" }}>
          <Avatar
            src={user().avatarUrl || undefined}
            alt={user().name}
            fallback={user().name.charAt(0)}
            size="sm"
          />
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="ghost" size="sm">
              Salir
            </Button>
          </form>
        </div>
      )}
    </Show>
  )
}
