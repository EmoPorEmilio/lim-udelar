import { eq, desc, and, sql } from 'drizzle-orm'
import { materials } from '../db/schema'
import { requireAuth, isResponse } from './utils'
import { checkQuota, adjustUsage } from './quota'

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024 // 50 MB
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
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
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

  const formData = await request.formData()
  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const subjectCode = (formData.get('subjectCode') as string) || null
  const semester = formData.get('semester') ? Number(formData.get('semester')) : null
  const areaCode = (formData.get('areaCode') as string) || null
  const file = formData.get('file') as File

  if (!title || !file) {
    return Response.json({ error: 'Título y archivo son requeridos' }, { status: 400 })
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return Response.json({ error: 'El archivo no puede superar 50 MB' }, { status: 400 })
  }

  const quotaCheck = await checkQuota(db, user.id, file.size)
  if (!quotaCheck.allowed) {
    return Response.json(
      { error: 'Has alcanzado tu límite de almacenamiento', used: quotaCheck.used, quota: quotaCheck.quota },
      { status: 413 },
    )
  }

  const id = crypto.randomUUID()
  const fileKey = `materials/${id}/${file.name}`

  try {
    await bucket.put(fileKey, file.stream(), {
      httpMetadata: { contentType: file.type },
    })
  } catch (err) {
    console.error('R2 upload error:', err)
    return Response.json({ error: 'Error al subir el archivo' }, { status: 500 })
  }

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

  await adjustUsage(db, user.id, file.size)

  return Response.json({ id }, { status: 201 })
}
