import { generateState, generateCodeVerifier } from 'arctic'
import { createGoogleOAuth } from '../auth/google'

export async function handleAuthGoogle(request: Request, env: Record<string, any>): Promise<Response> {
  const isSecure = new URL(request.url).protocol === 'https:'

  const google = createGoogleOAuth(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI)
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile'])

  const cookieFlags = `HttpOnly; SameSite=Lax; Path=/; Max-Age=600${isSecure ? '; Secure' : ''}`

  const headers = new Headers()
  headers.set('Location', url.toString())
  headers.append('Set-Cookie', `oauth_state=${state}; ${cookieFlags}`)
  headers.append('Set-Cookie', `oauth_code_verifier=${codeVerifier}; ${cookieFlags}`)

  return new Response(null, { status: 302, headers })
}
