import { eq, desc, and, sql } from 'drizzle-orm'
import { materials } from '../db/schema'
import { requireAuth, isResponse } from './utils'
import { tryReserveQuota, adjustUsage } from './quota'
import { SAFE_MIME_TYPES } from './validation'

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024 // 50 MB
const VALID_AREA_CODES = new Set(['ING', 'ICM', 'CI', 'COMP'])
const PAGE_SIZE = 20

function escapeLikePattern(pattern: string): string {
  return pattern.replace(/[%_\\]/g, (ch) => `\\${ch}`)
}

export async function handleMateriales(request: Request, env: Env): Promise<Response> {
  if (request.method === 'GET') return handleGet(request, env)
  return handlePost(request, env)
}

async function handleGet(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (isResponse(auth)) return auth

  const { db } = auth
  const url = new URL(request.url)
  const search = url.searchParams.get('search')
  const semester = url.searchParams.get('semester')
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const conditions = []
  if (search) {
    conditions.push(sql`${materials.title} LIKE ${'%' + escapeLikePattern(search) + '%'} ESCAPE '\\'`)
  }
  if (semester) {
    conditions.push(eq(materials.semester, Number(semester)))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [result, countResult] = await Promise.all([
    db
      .select()
      .from(materials)
      .where(where)
      .orderBy(desc(materials.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(materials)
      .where(where),
  ])

  const total = countResult[0]?.count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return Response.json({ materials: result, page, totalPages, total })
}

async function handlePost(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)
  if (isResponse(auth)) return auth

  const { user, db } = auth
  const bucket: R2Bucket = env.MATERIALS_BUCKET

  // Content-Length early check
  const contentLength = parseInt(request.headers.get('Content-Length') || '0', 10)
  if (contentLength > MAX_UPLOAD_SIZE) {
    return Response.json({ error: 'El archivo no puede superar 50 MB' }, { status: 400 })
  }

  const formData = await request.formData()

  // FormData type safety
  const titleRaw = formData.get('title')
  const descriptionRaw = formData.get('description')
  const subjectCodeRaw = formData.get('subjectCode')
  const semesterRaw = formData.get('semester')
  const areaCodeRaw = formData.get('areaCode')
  const fileRaw = formData.get('file')

  if (typeof titleRaw !== 'string' || !titleRaw) {
    return Response.json({ error: 'Título es requerido' }, { status: 400 })
  }
  if (!(fileRaw instanceof File) || fileRaw.size === 0) {
    return Response.json({ error: 'Archivo es requerido' }, { status: 400 })
  }

  const title = titleRaw.trim().slice(0, 200)
  if (!title) {
    return Response.json({ error: 'Título es requerido' }, { status: 400 })
  }
  const description = typeof descriptionRaw === 'string' ? descriptionRaw.trim().slice(0, 2000) || null : null
  const subjectCode = typeof subjectCodeRaw === 'string' ? subjectCodeRaw || null : null
  const areaCodeStr = typeof areaCodeRaw === 'string' ? areaCodeRaw || null : null
  const areaCode = areaCodeStr && VALID_AREA_CODES.has(areaCodeStr) ? areaCodeStr : null
  const file = fileRaw

  let semester: number | null = null
  if (typeof semesterRaw === 'string' && semesterRaw) {
    const n = parseInt(semesterRaw, 10)
    if (!isNaN(n) && n >= 1 && n <= 8) semester = n
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return Response.json({ error: 'El archivo no puede superar 50 MB' }, { status: 400 })
  }

  // File type validation
  if (!SAFE_MIME_TYPES.has(file.type)) {
    return Response.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
  }

  // Atomic quota reservation
  const quotaResult = await tryReserveQuota(db, user.id, file.size)
  if (!quotaResult.reserved) {
    return Response.json(
      { error: 'Has alcanzado tu límite de almacenamiento', used: quotaResult.used, quota: quotaResult.quota },
      { status: 413 },
    )
  }

  const id = crypto.randomUUID()
  const fileKey = `materials/${id}`

  try {
    await bucket.put(fileKey, file.stream(), {
      httpMetadata: { contentType: file.type },
    })
  } catch (err) {
    console.error('R2 upload error:', err)
    // Rollback quota reservation
    await adjustUsage(db, user.id, -file.size)
    return Response.json({ error: 'Error al subir el archivo' }, { status: 500 })
  }

  try {
    await db.insert(materials).values({
      id,
      title,
      description,
      subjectCode,
      semester,
      areaCode,
      fileKey,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy: user.id,
    })
  } catch (err) {
    console.error('DB insert error:', err)
    // Cleanup orphaned R2 object and rollback quota
    await bucket.delete(fileKey).catch(() => {})
    await adjustUsage(db, user.id, -file.size)
    return Response.json({ error: 'Error al guardar el material' }, { status: 500 })
  }

  return Response.json({ id }, { status: 201 })
}
