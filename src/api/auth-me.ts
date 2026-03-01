import { validateSession } from '../auth/session'
import { getDb } from '../db/index'

export async function handleAuthMe(request: Request, env: Record<string, any>): Promise<Response> {
  const db = getDb(env.DB)

  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)session_token=([^;]*)/)
  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null

  if (!token) {
    return Response.json({ user: null })
  }

  const result = await validateSession(db, token)

  if (!result) {
    return Response.json({ user: null })
  }

  return Response.json({
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      avatarUrl: result.user.avatarUrl,
      username: result.user.username,
      role: result.user.role,
    },
  })
}
