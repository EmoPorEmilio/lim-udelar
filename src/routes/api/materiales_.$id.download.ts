import { createAPIFileRoute } from '@tanstack/solid-start/api'
import { getRequestEvent } from 'solid-js/web'
import { eq } from 'drizzle-orm'
import { validateSession } from '../../auth/session'
import { getDb } from '../../db/index'
import { materials } from '../../db/schema'

export const APIRoute = createAPIFileRoute('/api/materiales/$id/download')({
  GET: async ({ request, params }) => {
    const event = getRequestEvent()!
    const env = (event as any).nativeEvent.context.cloudflare.env
    const db = getDb(env.DB)
    const bucket: R2Bucket = env.MATERIALS_BUCKET

    const cookieHeader = request.headers.get('cookie') || ''
    const tokenMatch = cookieHeader.match(/(?:^|;\s*)session_token=([^;]*)/)
    const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null

    if (!token) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const session = await validateSession(db, token)
    if (!session) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const [material] = await db
      .select()
      .from(materials)
      .where(eq(materials.id, params.id))
      .limit(1)

    if (!material) {
      return Response.json({ error: 'Material no encontrado' }, { status: 404 })
    }

    const object = await bucket.get(material.fileKey)
    if (!object) {
      return Response.json({ error: 'Archivo no encontrado' }, { status: 404 })
    }

    return new Response(object.body as ReadableStream, {
      headers: {
        'Content-Type': material.mimeType,
        'Content-Disposition': `attachment; filename="${material.fileName}"`,
        'Content-Length': String(material.fileSize),
      },
    })
  },
})
