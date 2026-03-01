import { eq } from 'drizzle-orm'
import type { Db } from '../db/index'
import { sessions, users } from '../db/schema'

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const SESSION_EXTEND_THRESHOLD_MS = 15 * 24 * 60 * 60 * 1000 // 15 days

export interface SessionValidationResult {
  user: typeof users.$inferSelect
  session: typeof sessions.$inferSelect
  sessionExtended: boolean
}

async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSession(db: Db, userId: string): Promise<string> {
  const token = generateSessionToken()
  const sessionId = await hashToken(token)
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  })
  return token // raw token for cookie
}

export async function validateSession(
  db: Db,
  token: string,
): Promise<SessionValidationResult | null> {
  const sessionId = await hashToken(token)

  const result = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1)

  if (result.length === 0) return null

  const { session, user } = result[0]

  if (session.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
    return null
  }

  let sessionExtended = false
  if (session.expiresAt.getTime() - Date.now() < SESSION_EXTEND_THRESHOLD_MS) {
    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() + SESSION_TTL_MS) })
      .where(eq(sessions.id, sessionId))
    sessionExtended = true
  }

  return { user, session, sessionExtended }
}

export async function destroySession(db: Db, token: string): Promise<void> {
  const sessionId = await hashToken(token)
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

export function sessionCookieString(token: string, isSecure: boolean): string {
  const parts = [
    `session_token=${token}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${SESSION_MAX_AGE}`,
  ]
  if (isSecure) parts.push('Secure')
  return parts.join('; ')
}

export function clearSessionCookieString(isSecure: boolean): string {
  const parts = [
    'session_token=',
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=0',
  ]
  if (isSecure) parts.push('Secure')
  return parts.join('; ')
}
