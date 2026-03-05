import { destroySession, clearSessionCookieString } from '../auth/session'
import { getDb } from '../db/index'
import { getSessionToken, isSecure } from './utils'

export async function handleAuthLogout(request: Request, env: Env): Promise<Response> {
  const db = getDb(env.DB)
  const secure = isSecure(request)
  const token = getSessionToken(request)

  if (token) {
    await destroySession(db, token)
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': clearSessionCookieString(secure),
    },
  })
}
