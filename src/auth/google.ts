import { Google } from 'arctic'

export function createGoogleOAuth(clientId: string, clientSecret: string, redirectUri: string) {
  return new Google(clientId, clientSecret, redirectUri)
}

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture: string
}

export async function fetchGoogleUser(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info')
  }

  return response.json()
}
