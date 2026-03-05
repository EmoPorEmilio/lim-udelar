import { eq } from 'drizzle-orm'
import { users } from '../db/schema'
import { requireAuth, isResponse } from './utils'
import { tryReserveQuota, adjustUsage } from './quota'
import { USERNAME_RE, MAX_AVATAR_SIZE } from './validation'

function isValidImageMagicBytes(header: Uint8Array): boolean {
  // JPEG: FF D8 FF
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return true
  // PNG: 89 50 4E 47
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) return true
  // GIF: 47 49 46 38
  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) return true
  // WebP: RIFF....WEBP
  if (
    header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
    header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50
  ) return true
  return false
}

export async function handleAuthProfile(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (isResponse(auth)) return auth

  const { user, db } = auth
  const userId = user.id

  // Content-Length early check
  const contentLength = parseInt(request.headers.get('Content-Length') || '0', 10)
  if (contentLength > MAX_AVATAR_SIZE + 1024) {
    return Response.json({ error: 'La solicitud es demasiado grande' }, { status: 400 })
  }

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
  let avatarUrl = user.avatarUrl

  if (avatar instanceof File && avatar.size > 0) {
    // Reject SVG explicitly
    if (avatar.type === 'image/svg+xml') {
      return Response.json({ error: 'No se permiten imágenes SVG' }, { status: 400 })
    }

    // Validate type
    if (!avatar.type.startsWith('image/')) {
      return Response.json({ error: 'El avatar debe ser una imagen' }, { status: 400 })
    }

    // Validate size (2MB)
    if (avatar.size > MAX_AVATAR_SIZE) {
      return Response.json({ error: 'El avatar no puede superar 2MB' }, { status: 400 })
    }

    // Read first chunk to validate magic bytes (avoids buffering entire file)
    const reader = avatar.stream().getReader()
    const { value: firstChunk } = await reader.read()
    reader.releaseLock()
    if (!firstChunk || !isValidImageMagicBytes(firstChunk.slice(0, 12))) {
      return Response.json({ error: 'El archivo no es una imagen válida' }, { status: 400 })
    }

    const key = `avatars/${userId}/avatar`
    const bucket = env.MATERIALS_BUCKET

    // Check quota for net size increase
    let oldSize = 0
    try {
      const head = await bucket.head(key)
      if (head) oldSize = head.size
    } catch { /* no existing avatar */ }

    const netIncrease = avatar.size - oldSize
    if (netIncrease > 0) {
      const quotaResult = await tryReserveQuota(db, userId, netIncrease)
      if (!quotaResult.reserved) {
        return Response.json(
          { error: 'Has alcanzado tu límite de almacenamiento', used: quotaResult.used, quota: quotaResult.quota },
          { status: 413 },
        )
      }
    }

    try {
      await bucket.put(key, avatar.stream(), {
        httpMetadata: { contentType: avatar.type },
      })
    } catch (err) {
      console.error('R2 avatar upload error:', err)
      // Rollback quota reservation if we reserved
      if (netIncrease > 0) {
        await adjustUsage(db, userId, -netIncrease)
      }
      return Response.json({ error: 'Error al subir el avatar' }, { status: 500 })
    }

    // If replacing a smaller avatar, adjust usage for the negative delta
    if (netIncrease < 0) {
      await adjustUsage(db, userId, netIncrease)
    }

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
