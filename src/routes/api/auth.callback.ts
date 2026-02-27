import { createAPIFileRoute } from '@tanstack/solid-start/api'
import { getRequestEvent } from 'solid-js/web'
import { eq } from 'drizzle-orm'
import { exchangeCodeForTokens, getGoogleUserInfo } from '../../auth/google'
import { createSession } from '../../auth/session'
import { getDb } from '../../db/index'
import { users } from '../../db/schema'

export const APIRoute = createAPIFileRoute('/api/auth/callback')({
  GET: async ({ request }) => {
    const event = getRequestEvent()!
    const env = (event as any).nativeEvent.context.cloudflare.env
    const db = getDb(env.DB)

    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    // Validate state
    const cookieHeader = request.headers.get('cookie') || ''
    const stateMatch = cookieHeader.match(/(?:^|;\s*)oauth_state=([^;]*)/)
    const savedState = stateMatch ? decodeURIComponent(stateMatch[1]) : null

    if (!code || !state || state !== savedState) {
      return new Response('Invalid OAuth state', { status: 400 })
    }

    try {
      const tokens = await exchangeCodeForTokens(
        code,
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        env.GOOGLE_REDIRECT_URI,
      )

      const googleUser = await getGoogleUserInfo(tokens.access_token)

      // Upsert user
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.googleId, googleUser.id))
        .limit(1)

      let userId: string

      if (existing.length > 0) {
        userId = existing[0].id
        await db
          .update(users)
          .set({
            email: googleUser.email,
            name: googleUser.name,
            avatarUrl: googleUser.picture,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
      } else {
        userId = crypto.randomUUID()
        await db.insert(users).values({
          id: userId,
          googleId: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: googleUser.picture,
        })
      }

      const sessionToken = await createSession(db, userId)

      const maxAge = 30 * 24 * 60 * 60 // 30 days in seconds
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/materiales',
          'Set-Cookie': [
            `session_token=${sessionToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`,
            `oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
          ].join(', '),
        },
      })
    } catch (err) {
      console.error('OAuth callback error:', err)
      return new Response('Authentication failed', { status: 500 })
    }
  },
})
