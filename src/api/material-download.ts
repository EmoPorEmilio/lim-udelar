import { eq } from 'drizzle-orm'
import { materials } from '../db/schema'
import { requireAuth, isResponse } from './utils'
import { SAFE_MIME_TYPES } from './validation'

function encodeContentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '\\"')
  const encoded = encodeURIComponent(filename)
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`
}

export async function handleMaterialDownload(
  request: Request,
  env: Env,
  id: string,
): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (isResponse(auth)) return auth

  const { db } = auth
  const bucket: R2Bucket = env.MATERIALS_BUCKET

  const [material] = await db
    .select()
    .from(materials)
    .where(eq(materials.id, id))
    .limit(1)

  if (!material) {
    return Response.json({ error: 'Material no encontrado' }, { status: 404 })
  }

  let object: R2ObjectBody | null
  try {
    object = await bucket.get(material.fileKey)
  } catch (err) {
    console.error('R2 download error:', err)
    return Response.json({ error: 'Error al descargar el archivo' }, { status: 500 })
  }

  if (!object) {
    return Response.json({ error: 'Archivo no encontrado' }, { status: 404 })
  }

  const contentType = SAFE_MIME_TYPES.has(material.mimeType)
    ? material.mimeType
    : 'application/octet-stream'

  return new Response(object.body as ReadableStream, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': encodeContentDisposition(material.fileName),
      'Content-Length': String(material.fileSize),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
