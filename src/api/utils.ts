import { validateSession } from '../auth/session'
import { getDb } from '../db/index'
import type { Db } from '../db/index'
import type { SessionValidationResult } from '../auth/session'

export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function getSessionToken(request: Request): string | null {
  return getCookie(request, 'session_token')
}

export function isSecure(request: Request): boolean {
  return new URL(request.url).protocol === 'https:'
}

interface AuthResult {
  user: SessionValidationResult['user']
  session: SessionValidationResult['session']
  db: Db
}

export async function requireAuth(request: Request, env: Env): Promise<AuthResult | Response> {
  const db = getDb(env.DB)
  const token = getSessionToken(request)

  if (!token) {
    return Response.json({ error: 'No autenticado' }, { status: 401 })
  }

  const result = await validateSession(db, token)
  if (!result) {
    return Response.json({ error: 'Sesión inválida' }, { status: 401 })
  }

  return { user: result.user, session: result.session, db }
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response
}
