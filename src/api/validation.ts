export function sanitizeReturnTo(raw: string): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return '/'
  }
  return raw
}

export function checkOrigin(request: Request): boolean {
  const method = request.method
  if (method === 'GET' || method === 'HEAD') return true

  const origin = request.headers.get('Origin')
  if (!origin) return false

  const requestOrigin = new URL(request.url).origin
  return origin === requestOrigin
}

export const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2 MB

export const SAFE_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
  'application/gzip',
  'text/plain',
  'text/csv',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
  'video/webm',
])

export function safeDecodeURIComponent(str: string): string {
  try {
    return decodeURIComponent(str)
  } catch {
    return str
  }
}
