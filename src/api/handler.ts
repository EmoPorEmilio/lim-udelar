import { handleAuthGoogle } from './auth-google'
import { handleAuthCallback } from './auth-callback'
import { handleAuthLogout } from './auth-logout'
import { handleAuthMe } from './auth-me'
import { handleAuthProfile } from './auth-profile'
import { handleAuthAvatar } from './auth-avatar'
import { handleMateriales } from './materiales'
import { handleMaterialDownload } from './material-download'

export async function handleApiRoute(
  request: Request,
  env: Record<string, unknown>,
): Promise<Response | null> {
  const url = new URL(request.url)
  const { pathname } = url

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

  return null
}
