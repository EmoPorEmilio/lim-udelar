import { generateState, generateCodeVerifier } from 'arctic'
import { createGoogleOAuth } from '../auth/google'
import { validateSession } from '../auth/session'
import { getDb } from '../db/index'

export async function handleAuthGoogle(request: Request, env: Record<string, any>): Promise<Response> {
  const url = new URL(request.url)
  const isSecure = url.protocol === 'https:'

  // Read returnTo from query param, validate it starts with /
  let returnTo = url.searchParams.get('returnTo') || '/'
  if (!returnTo.startsWith('/')) returnTo = '/'

  // If user already has a valid session, skip OAuth and redirect directly
  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)session_token=([^;]*)/)
  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null

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
  const google = createGoogleOAuth(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI)
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const authUrl = google.createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile'])

  const cookieFlags = `HttpOnly; SameSite=Lax; Path=/; Max-Age=600${isSecure ? '; Secure' : ''}`

  const headers = new Headers()
  headers.set('Location', authUrl.toString())
  headers.append('Set-Cookie', `oauth_state=${state}; ${cookieFlags}`)
  headers.append('Set-Cookie', `oauth_code_verifier=${codeVerifier}; ${cookieFlags}`)
  headers.append('Set-Cookie', `oauth_return_to=${encodeURIComponent(returnTo)}; ${cookieFlags}`)

  return new Response(null, { status: 302, headers })
}
