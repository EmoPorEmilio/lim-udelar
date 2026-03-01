import { eq } from 'drizzle-orm'
import { validateSession } from '../auth/session'
import { getDb } from '../db/index'
import { users } from '../db/schema'

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

export async function handleAuthProfile(request: Request, env: Record<string, any>): Promise<Response> {
  const db = getDb(env.DB)

  // Auth check
  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)session_token=([^;]*)/)
  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null

  if (!token) {
    return Response.json({ error: 'No autenticado' }, { status: 401 })
  }

  const result = await validateSession(db, token)
  if (!result) {
    return Response.json({ error: 'Sesión inválida' }, { status: 401 })
  }

  const userId = result.user.id

  // Parse FormData
  const formData = await request.formData()
  const username = formData.get('username')
  const avatar = formData.get('avatar')

  // Validate username
  if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
    return Response.json(
      { error: 'El nombre de usuario debe tener entre 3 y 20 caracteres (letras, números o _)' },
      { status: 400 },
    )
  }

  // Check uniqueness
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)

  if (existing.length > 0 && existing[0].id !== userId) {
    return Response.json({ error: 'Ese nombre de usuario ya está en uso' }, { status: 409 })
  }

  // Handle avatar upload
  let avatarUrl = result.user.avatarUrl

  if (avatar instanceof File && avatar.size > 0) {
    // Validate type
    if (!avatar.type.startsWith('image/')) {
      return Response.json({ error: 'El avatar debe ser una imagen' }, { status: 400 })
    }

    // Validate size (2MB)
    if (avatar.size > 2 * 1024 * 1024) {
      return Response.json({ error: 'El avatar no puede superar 2MB' }, { status: 400 })
    }

    const ext = avatar.name.split('.').pop() || 'png'
    const key = `avatars/${userId}/avatar.${ext}`
    const bucket = env.MATERIALS_BUCKET as R2Bucket

    await bucket.put(key, await avatar.arrayBuffer(), {
      httpMetadata: { contentType: avatar.type },
    })

    avatarUrl = `/api/auth/avatar/${userId}`
  }

  // Update user
  await db
    .update(users)
    .set({
      username,
      avatarUrl,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))

  return Response.json({ ok: true })
}
