import { createMiddleware } from '@tanstack/solid-start'
import { getCookie } from '@tanstack/solid-start/server'
import { getDb } from '../db/index'
import { validateSession } from './session'
import type { AuthUser } from './context'

export const authMiddleware = createMiddleware().server(async ({ next, context }) => {
  let user: AuthUser | null = null
  try {
    const token = getCookie('session_token')
    const env = (context as unknown as Record<string, unknown>)?.env as Env | undefined
    if (token && env?.DB) {
      const db = getDb(env.DB)
      const result = await validateSession(db, token)
      if (result) {
        user = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          avatarUrl: result.user.avatarUrl,
          username: result.user.username,
          role: result.user.role,
          storageQuotaBytes: result.user.storageQuotaBytes,
          storageBytesUsed: result.user.storageBytesUsed,
        }
      }
    }
  } catch { /* user stays null */ }
  return next({ context: { user } })
})
