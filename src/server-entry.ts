import { createStartHandler, defaultStreamHandler } from '@tanstack/solid-start/server'
import { handleApiRoute } from './api/handler'

const tanstackFetch = createStartHandler(defaultStreamHandler) as (
  request: Request,
  ...args: unknown[]
) => Promise<Response>

function withSecurityHeaders(response: Response): Response {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return response
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return withSecurityHeaders(await handleApiRoute(request, env))
    }

    return withSecurityHeaders(await tanstackFetch(request, { context: { env } }))
  },
}
