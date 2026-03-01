import { destroySession, clearSessionCookieString } from '../auth/session'
import { getDb } from '../db/index'

export async function handleAuthLogout(request: Request, env: Record<string, any>): Promise<Response> {
  const db = getDb(env.DB)
  const isSecure = new URL(request.url).protocol === 'https:'

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
      'Set-Cookie': clearSessionCookieString(isSecure),
    },
  })
}
