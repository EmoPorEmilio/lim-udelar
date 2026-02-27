import { createAPIFileRoute } from '@tanstack/solid-start/api'
import { getRequestEvent } from 'solid-js/web'
import { validateSession } from '../../auth/session'
import { getDb } from '../../db/index'

export const APIRoute = createAPIFileRoute('/api/auth/me')({
  GET: async ({ request }) => {
    const event = getRequestEvent()!
    const env = (event as any).nativeEvent.context.cloudflare.env
    const db = getDb(env.DB)

    const cookieHeader = request.headers.get('cookie') || ''
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)session_token=([^;]*)/)
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null

    if (!token) {
      return Response.json({ user: null })
    }

    const result = await validateSession(db, token)

    if (!result) {
      return Response.json({ user: null })
    }

    return Response.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        avatarUrl: result.user.avatarUrl,
      },
    })
  },
})
