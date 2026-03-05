/// <reference types="vite/client" />
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/solid-router'
import { HydrationScript } from 'solid-js/web'
import type { JSX } from 'solid-js'
import { DefaultCatchBoundary } from '../components/DefaultCatchBoundary'
import { NotFound } from '../components/NotFound'
import { AuthContext } from '../auth/context'
import type { AuthUser } from '../auth/context'
import { ToastProvider, ToastRegion } from '@proyecto-viviana/ui/toast'
import { createServerFn } from '@tanstack/solid-start'
import { authMiddleware } from '../auth/middleware'
import appCss from '../styles/app.css?url'

const getAuthUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AuthUser | null> => {
    return (context as { user: AuthUser | null }).user ?? null
  })

export const Route = createRootRoute({
  beforeLoad: async (): Promise<{ user: AuthUser | null }> => {
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

  return (
    <AuthContext.Provider value={{ user: context().user ?? null }}>
      <ToastProvider>
        <Outlet />
        <ToastRegion placement="bottom-end" />
      </ToastProvider>
    </AuthContext.Provider>
  )
}

function RootDocument(props: { children: JSX.Element }) {
  return (
    <html lang="es">
      <head>
        <script innerHTML={`(function(){try{var t=localStorage.getItem('lim-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else document.documentElement.setAttribute('data-theme','dark')}catch(e){document.documentElement.setAttribute('data-theme','dark')}})()`} />
        <HydrationScript />
        <HeadContent />
      </head>
      <body>
        {props.children}
        <Scripts />
      </body>
    </html>
  )
}
