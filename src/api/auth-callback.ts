import { eq } from 'drizzle-orm'
import { createGoogleOAuth, fetchGoogleUser } from '../auth/google'
import { createSession, sessionCookieString } from '../auth/session'
import { getDb } from '../db/index'
import { users } from '../db/schema'
import { getCookie, isSecure } from './utils'
import { getDefaultQuota } from './quota'

export async function handleAuthCallback(request: Request, env: Env): Promise<Response> {
  const db = getDb(env.DB)
  const secure = isSecure(request)

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const savedState = getCookie(request, 'oauth_state')
  const codeVerifier = getCookie(request, 'oauth_code_verifier')

  if (!code || !state || state !== savedState || !codeVerifier) {
    return Response.json({ error: 'Invalid OAuth state' }, { status: 400 })
  }

  // Read return URL from cookie (default /)
  let returnTo = getCookie(request, 'oauth_return_to') || '/'
  if (!returnTo.startsWith('/')) returnTo = '/'

  try {
    const redirectUri = new URL('/api/auth/callback', request.url).origin + '/api/auth/callback'
    const google = createGoogleOAuth(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri)
    const tokens = await google.validateAuthorizationCode(code, codeVerifier)
    const googleUser = await fetchGoogleUser(tokens.accessToken())

    // Upsert user
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleUser.id))
      .limit(1)

    let userId: string
    let username: string | null = null

    if (existing.length > 0) {
      userId = existing[0].id
      username = existing[0].username
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
        storageQuotaBytes: getDefaultQuota('student'),
      })
    }

    const sessionToken = await createSession(db, userId)

    // Redirect: if no username yet, send to onboarding; otherwise to returnTo
    const redirectTo = username === null
      ? `/perfil?returnTo=${encodeURIComponent(returnTo)}`
      : returnTo

    const clearFlags = `HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure ? '; Secure' : ''}`
    const headers = new Headers()
    headers.set('Location', redirectTo)
    headers.append('Set-Cookie', sessionCookieString(sessionToken, secure))
    headers.append('Set-Cookie', `oauth_state=; ${clearFlags}`)
    headers.append('Set-Cookie', `oauth_code_verifier=; ${clearFlags}`)
    headers.append('Set-Cookie', `oauth_return_to=; ${clearFlags}`)

    return new Response(null, { status: 302, headers })
  } catch (err) {
    console.error('OAuth callback error:', err)
    return Response.json({ error: 'Error de autenticación. Intenta nuevamente.' }, { status: 500 })
  }
}
