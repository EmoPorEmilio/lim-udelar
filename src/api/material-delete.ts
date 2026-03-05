import { eq } from 'drizzle-orm'
import { materials } from '../db/schema'
import { requireAuth, isResponse } from './utils'
import { adjustUsage } from './quota'

export async function handleMaterialDelete(
  request: Request,
  env: Env,
  materialId: string,
): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (isResponse(auth)) return auth

  const { user, db } = auth

  const result = await db
    .select()
    .from(materials)
    .where(eq(materials.id, materialId))
    .limit(1)

  if (result.length === 0) {
    return Response.json({ error: 'Material no encontrado' }, { status: 404 })
  }

  const material = result[0]

  if (material.uploadedBy !== user.id && user.role !== 'admin') {
    return Response.json({ error: 'No tenés permiso para eliminar este material' }, { status: 403 })
  }

  const bucket: R2Bucket = env.MATERIALS_BUCKET

  try {
    await bucket.delete(material.fileKey)
  } catch (err) {
    console.error('R2 delete error (non-fatal):', err)
  }

  await db.delete(materials).where(eq(materials.id, materialId))
  await adjustUsage(db, material.uploadedBy, -material.fileSize)

  return Response.json({ ok: true })
}
