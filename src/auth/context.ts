import { createContext, useContext } from 'solid-js'
import type { UserRole } from '../db/schema'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  username: string | null
  role: UserRole
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
