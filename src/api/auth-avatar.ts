export async function handleAuthAvatar(request: Request, env: Record<string, any>, userId: string): Promise<Response> {
  const bucket = env.MATERIALS_BUCKET as R2Bucket

  const listed = await bucket.list({ prefix: `avatars/${userId}/` })

  if (listed.objects.length === 0) {
    return new Response('Not found', { status: 404 })
  }

  const obj = await bucket.get(listed.objects[0].key)
  if (!obj) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
