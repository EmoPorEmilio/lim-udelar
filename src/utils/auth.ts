export function getLoginUrl(returnTo?: string): string {
  const path = returnTo || '/'
  return `/api/auth/google?returnTo=${encodeURIComponent(path)}`
}
