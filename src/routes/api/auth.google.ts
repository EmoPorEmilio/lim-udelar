import { createAPIFileRoute } from '@tanstack/solid-start/api'
import { getRequestEvent } from 'solid-js/web'
import { getGoogleAuthUrl } from '../../auth/google'

export const APIRoute = createAPIFileRoute('/api/auth/google')({
  GET: async () => {
    const event = getRequestEvent()!
    const env = (event as any).nativeEvent.context.cloudflare.env

    const state = crypto.randomUUID()

    const authUrl = getGoogleAuthUrl(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_REDIRECT_URI,
      state,
    )

    return new Response(null, {
      status: 302,
      headers: {
        Location: authUrl,
        'Set-Cookie': `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`,
      },
    })
  },
})
