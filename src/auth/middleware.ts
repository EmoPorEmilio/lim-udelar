import { createMiddleware } from '@tanstack/solid-start'
import { getRequestEvent } from 'solid-js/web'
import { getDb } from '../db/index'
import { validateSession, sessionCookieString } from './session'
import type { SessionValidationResult } from './session'

function getCloudflareEnv() {
  const event = getRequestEvent()
  if (!event) throw new Error('No request event')
  return (event as any).nativeEvent.context.cloudflare.env
}

function getCookie(name: string): string | undefined {
  const event = getRequestEvent()
  if (!event) return undefined
  const cookieHeader = (event as any).nativeEvent.node?.req?.headers?.cookie
    || (event as any).request?.headers?.get('cookie')
    || ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

function getIsSecure(): boolean {
  const event = getRequestEvent()
  if (!event) return false
  const url = (event as any).request?.url
  return url ? new URL(url).protocol === 'https:' : false
}

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  let user = null
  let db = null

  try {
    const env = getCloudflareEnv()
    db = getDb(env.DB)

    const token = getCookie('session_token')
    if (token) {
      const result = await validateSession(db, token)
      if (result) {
        user = result.user
        if (result.sessionExtended) {
          const event = getRequestEvent()
          if (event) {
            const isSecure = getIsSecure()
            ;(event as any).nativeEvent.node?.res?.appendHeader?.(
              'Set-Cookie',
              sessionCookieString(token, isSecure),
            )
          }
        }
      }
    }
  } catch {
    // Not in Cloudflare environment (dev without D1), continue without auth
  }

  return next({ context: { user, db } })
})

export const requireAuthMiddleware = createMiddleware().server(async ({ next }) => {
  let user = null
  let db = null

  try {
    const env = getCloudflareEnv()
    db = getDb(env.DB)

    const token = getCookie('session_token')
    if (token) {
      const result = await validateSession(db, token)
      if (result) {
        user = result.user
        if (result.sessionExtended) {
          const event = getRequestEvent()
          if (event) {
            const isSecure = getIsSecure()
            ;(event as any).nativeEvent.node?.res?.appendHeader?.(
              'Set-Cookie',
              sessionCookieString(token, isSecure),
            )
          }
        }
      }
    }
  } catch {
    // Not in Cloudflare environment
  }

  if (!user) {
    throw new Response(null, {
      status: 302,
      headers: { Location: '/api/auth/google' },
    })
  }

  return next({ context: { user, db } })
})
