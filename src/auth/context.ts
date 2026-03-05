import { createContext, useContext } from 'solid-js'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  username: string | null
  role: string
  storageQuotaBytes: number
  storageBytesUsed: number
}

interface AuthContextValue {
  user: AuthUser | null
}

export const AuthContext = createContext<AuthContextValue>({ user: null })

export function useAuth() {
  return useContext(AuthContext)
}
