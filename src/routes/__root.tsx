/// <reference types="vite/client" />
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/solid-router'
import { HydrationScript } from 'solid-js/web'
import { onMount, type JSX } from 'solid-js'
import { initTheme } from '../theme'
import { DefaultCatchBoundary } from '../components/DefaultCatchBoundary'
import { NotFound } from '../components/NotFound'
import { AuthContext } from '../auth/context'
import type { AuthUser } from '../auth/context'
import { createServerFn } from '@tanstack/solid-start'
import appCss from '../styles/app.css?url'

const getAuthUser = createServerFn({ method: 'GET' }).handler(async (): Promise<AuthUser | null> => {
  try {
    const { getRequestEvent } = await import('solid-js/web')
    const event = getRequestEvent()
    if (!event) return null

    const env = (event as any).nativeEvent?.context?.cloudflare?.env
    if (!env?.DB) return null

    const { getDb } = await import('../db/index')
    const { validateSession } = await import('../auth/session')
    const db = getDb(env.DB)

    const cookieHeader = (event as any).request?.headers?.get('cookie') || ''
    const match = cookieHeader.match(/(?:^|;\s*)session_token=([^;]*)/)
    const token = match ? decodeURIComponent(match[1]) : null

    if (!token) return null

    const result = await validateSession(db, token)
    if (!result) return null

    return {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      avatarUrl: result.user.avatarUrl,
      role: result.user.role,
    }
  } catch {
    return null
  }
})

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await getAuthUser()
    return { user }
  },
  head: () => ({
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'LIM — Ingeniería de Medios' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800&family=Sen:wght@400;500;600;700&display=swap' },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootComponent() {
  const context = Route.useRouteContext()

  onMount(() => {
    initTheme()
  })

  return (
    <AuthContext.Provider value={{ user: context().user ?? null }}>
      <Outlet />
    </AuthContext.Provider>
  )
}

function RootDocument(props: { children: JSX.Element }) {
  return (
    <html lang="es">
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        {props.children}
        <Scripts />
      </body>
    </html>
  )
}
