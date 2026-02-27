import { createAPIFileRoute } from '@tanstack/solid-start/api'
import { getRequestEvent } from 'solid-js/web'
import { destroySession } from '../../auth/session'
import { getDb } from '../../db/index'

export const APIRoute = createAPIFileRoute('/api/auth/logout')({
  POST: async ({ request }) => {
    const event = getRequestEvent()!
    const env = (event as any).nativeEvent.context.cloudflare.env
    const db = getDb(env.DB)

    const cookieHeader = request.headers.get('cookie') || ''
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)session_token=([^;]*)/)
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null

    if (token) {
      await destroySession(db, token)
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
        'Set-Cookie': 'session_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0',
      },
    })
  },
})
