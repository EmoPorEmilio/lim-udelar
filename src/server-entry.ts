import { createStartHandler, defaultStreamHandler } from '@tanstack/solid-start/server'
import { handleApiRoute } from './api/handler'

const tanstackFetch = createStartHandler(defaultStreamHandler) as (
  request: Request,
  ...args: unknown[]
) => Promise<Response>

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      const response = await handleApiRoute(request, env)
      if (response) return response
    }

    return tanstackFetch(request, { context: { env } })
  },
}
