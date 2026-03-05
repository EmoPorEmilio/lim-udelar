import { handleAuthGoogle } from './auth-google'
import { handleAuthCallback } from './auth-callback'
import { handleAuthLogout } from './auth-logout'
import { handleAuthMe } from './auth-me'
import { handleAuthProfile } from './auth-profile'
import { handleAuthAvatar } from './auth-avatar'
import { handleMateriales } from './materiales'
import { handleMaterialDownload } from './material-download'
import { handleMaterialDelete } from './material-delete'

const RATE_LIMITED_RESPONSE = (retryAfter: number) =>
  Response.json(
    { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  )

export async function handleApiRoute(
  request: Request,
  env: Env,
): Promise<Response | null> {
  const url = new URL(request.url)
  const { pathname } = url

  try {
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown'

    // Rate limit auth endpoints
    if (pathname === '/api/auth/google' || pathname === '/api/auth/callback') {
      const { success } = await env.AUTH_LIMITER.limit({ key: clientIp })
      if (!success) return RATE_LIMITED_RESPONSE(60)
    }

    // Rate limit upload/delete endpoints
    if (
      (pathname === '/api/materiales' && request.method === 'POST') ||
      (pathname === '/api/auth/profile' && request.method === 'POST') ||
      (pathname.startsWith('/api/materiales/') && request.method === 'DELETE')
    ) {
      const { success } = await env.UPLOAD_LIMITER.limit({ key: clientIp })
      if (!success) return RATE_LIMITED_RESPONSE(60)
    }

    if (pathname === '/api/auth/google' && request.method === 'GET') {
      return handleAuthGoogle(request, env)
    }
    if (pathname === '/api/auth/callback' && request.method === 'GET') {
      return handleAuthCallback(request, env)
    }
    if (pathname === '/api/auth/logout' && request.method === 'POST') {
      return handleAuthLogout(request, env)
    }
    if (pathname === '/api/auth/me' && request.method === 'GET') {
      return handleAuthMe(request, env)
    }
    if (pathname === '/api/auth/profile' && request.method === 'POST') {
      return handleAuthProfile(request, env)
    }
    if (pathname === '/api/materiales' && (request.method === 'GET' || request.method === 'POST')) {
      return handleMateriales(request, env)
    }

    const avatarMatch = pathname.match(/^\/api\/auth\/avatar\/([^/]+)$/)
    if (avatarMatch && request.method === 'GET') {
      return handleAuthAvatar(request, env, avatarMatch[1])
    }

    const downloadMatch = pathname.match(/^\/api\/materiales\/([^/]+)\/download$/)
    if (downloadMatch && request.method === 'GET') {
      return handleMaterialDownload(request, env, downloadMatch[1])
    }

    const deleteMatch = pathname.match(/^\/api\/materiales\/([^/]+)$/)
    if (deleteMatch && request.method === 'DELETE') {
      return handleMaterialDelete(request, env, deleteMatch[1])
    }

    return null
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
