import { eq } from 'drizzle-orm'
import type { Db } from '../db/index'
import { sessions, users } from '../db/schema'

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export function generateSessionToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSession(db: Db, userId: string): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await db.insert(sessions).values({
    id: token,
    userId,
    expiresAt,
  })

  return token
}

export async function validateSession(db: Db, token: string) {
  const result = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, token))
    .limit(1)

  if (result.length === 0) return null

  const { session, user } = result[0]

  if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, token))
    return null
  }

  return { session, user }
}

export async function destroySession(db: Db, token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, token))
}
