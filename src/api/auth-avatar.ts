export async function handleAuthAvatar(request: Request, env: Env, userId: string): Promise<Response> {
  const bucket = env.MATERIALS_BUCKET

  let obj: R2ObjectBody | null
  try {
    obj = await bucket.get(`avatars/${userId}/avatar`)
  } catch (err) {
    console.error('R2 avatar fetch error:', err)
    return Response.json({ error: 'Error al obtener el avatar' }, { status: 500 })
  }

  if (!obj) {
    return Response.json({ error: 'Avatar no encontrado' }, { status: 404 })
  }

  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
