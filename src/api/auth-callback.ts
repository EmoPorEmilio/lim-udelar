import { eq } from 'drizzle-orm'
import { createGoogleOAuth, fetchGoogleUser } from '../auth/google'
import { createSession, sessionCookieString } from '../auth/session'
import { getDb } from '../db/index'
import { users } from '../db/schema'

function getCookieValue(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export async function handleAuthCallback(request: Request, env: Record<string, any>): Promise<Response> {
  const db = getDb(env.DB)
  const isSecure = new URL(request.url).protocol === 'https:'

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const cookieHeader = request.headers.get('cookie') || ''
  const savedState = getCookieValue(cookieHeader, 'oauth_state')
  const codeVerifier = getCookieValue(cookieHeader, 'oauth_code_verifier')

  if (!code || !state || state !== savedState || !codeVerifier) {
    return new Response('Invalid OAuth state', { status: 400 })
  }

  // Read return URL from cookie (default /)
  let returnTo = getCookieValue(cookieHeader, 'oauth_return_to') || '/'
  if (!returnTo.startsWith('/')) returnTo = '/'

  try {
    const google = createGoogleOAuth(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI)
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
      })
    }

    const sessionToken = await createSession(db, userId)

    // Redirect: if no username yet, send to onboarding; otherwise to returnTo
    const redirectTo = username === null
      ? `/bienvenida?returnTo=${encodeURIComponent(returnTo)}`
      : returnTo

    const clearFlags = `HttpOnly; SameSite=Lax; Path=/; Max-Age=0${isSecure ? '; Secure' : ''}`
    const headers = new Headers()
    headers.set('Location', redirectTo)
    headers.append('Set-Cookie', sessionCookieString(sessionToken, isSecure))
    headers.append('Set-Cookie', `oauth_state=; ${clearFlags}`)
    headers.append('Set-Cookie', `oauth_code_verifier=; ${clearFlags}`)
    headers.append('Set-Cookie', `oauth_return_to=; ${clearFlags}`)

    return new Response(null, { status: 302, headers })
  } catch (err) {
    console.error('OAuth callback error:', err)
    return new Response('Authentication failed', { status: 500 })
  }
}
