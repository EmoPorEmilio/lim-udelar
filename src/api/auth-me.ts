import { requireAuth, isResponse } from './utils'

export async function handleAuthMe(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env)

  if (isResponse(auth)) {
    return auth
  }

  return Response.json({
    user: {
      id: auth.user.id,
      email: auth.user.email,
      name: auth.user.name,
      avatarUrl: auth.user.avatarUrl,
      username: auth.user.username,
      role: auth.user.role,
      storageQuotaBytes: auth.user.storageQuotaBytes,
      storageBytesUsed: auth.user.storageBytesUsed,
    },
  })
}
