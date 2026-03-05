import { generateState, generateCodeVerifier } from 'arctic'
import { createGoogleOAuth } from '../auth/google'
import { validateSession } from '../auth/session'
import { getDb } from '../db/index'
import { getSessionToken, isSecure } from './utils'
import { sanitizeReturnTo } from './validation'

export async function handleAuthGoogle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const secure = isSecure(request)

  const returnTo = sanitizeReturnTo(url.searchParams.get('returnTo') || '/')

  // If user already has a valid session, skip OAuth and redirect directly
  const token = getSessionToken(request)

  if (token) {
    const db = getDb(env.DB)
    const result = await validateSession(db, token)
    if (result) {
      return new Response(null, {
        status: 302,
        headers: { Location: returnTo },
      })
    }
  }

  // No valid session — proceed with OAuth
  const redirectUri = new URL('/api/auth/callback', request.url).origin + '/api/auth/callback'
  const google = createGoogleOAuth(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirectUri)
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const authUrl = google.createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile'])

  const cookieFlags = `HttpOnly; SameSite=Lax; Path=/; Max-Age=600${secure ? '; Secure' : ''}`

  const headers = new Headers()
  headers.set('Location', authUrl.toString())
  headers.append('Set-Cookie', `oauth_state=${state}; ${cookieFlags}`)
  headers.append('Set-Cookie', `oauth_code_verifier=${codeVerifier}; ${cookieFlags}`)
  headers.append('Set-Cookie', `oauth_return_to=${encodeURIComponent(returnTo)}; ${cookieFlags}`)

  return new Response(null, { status: 302, headers })
}
