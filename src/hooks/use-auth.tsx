import { createContext, useContext } from 'react'
import type { SkipCloudUser } from '@/lib/skip-cloud'

interface AuthContextType {
  isAuthenticated: boolean
  user: SkipCloudUser | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
