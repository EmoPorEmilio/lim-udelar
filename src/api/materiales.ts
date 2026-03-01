import { eq, desc, like, and } from 'drizzle-orm'
import { validateSession } from '../auth/session'
import { getDb } from '../db/index'
import { materials } from '../db/schema'

function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/(?:^|;\s*)session_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export async function handleMateriales(request: Request, env: Record<string, any>): Promise<Response> {
  if (request.method === 'GET') return handleGet(request, env)
  return handlePost(request, env)
}

async function handleGet(request: Request, env: Record<string, any>): Promise<Response> {
  const db = getDb(env.DB)

  const token = getSessionToken(request)
  if (!token) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const session = await validateSession(db, token)
  if (!session) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const url = new URL(request.url)
  const search = url.searchParams.get('search')
  const semester = url.searchParams.get('semester')

  const conditions = []
  if (search) {
    conditions.push(like(materials.title, `%${search}%`))
  }
  if (semester) {
    conditions.push(eq(materials.semester, Number(semester)))
  }

  const result = await db
    .select()
    .from(materials)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(materials.createdAt))

  return Response.json({ materials: result })
}

async function handlePost(request: Request, env: Record<string, any>): Promise<Response> {
  const db = getDb(env.DB)
  const bucket: R2Bucket = env.MATERIALS_BUCKET

  const token = getSessionToken(request)
  if (!token) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const session = await validateSession(db, token)
  if (!session) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

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

  const id = crypto.randomUUID()
  const fileKey = `materials/${id}/${file.name}`

  await bucket.put(fileKey, file.stream(), {
    httpMetadata: { contentType: file.type },
  })

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
    uploadedBy: session.user.id,
  })

  return Response.json({ id }, { status: 201 })
}
