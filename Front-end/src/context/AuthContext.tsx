import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as authService from '../services/authService'
import type { User } from '../types'

interface AuthApi {
  user: User | null
  ready: boolean
  login: (email: string, password: string, admin?: boolean) => Promise<User>
  register: (input: authService.RegisterInput) => Promise<User>
  logout: () => Promise<void>
  setUser: (u: User) => void
}

const AuthContext = createContext<AuthApi | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    authService
      .me()
      .then(setUser)
      .finally(() => setReady(true))
  }, [])

  const api: AuthApi = {
    user,
    ready,
    setUser,
    login: async (email, password, admin) => {
      const u = await authService.login(email, password, admin)
      setUser(u)
      return u
    },
    register: async (input) => {
      const u = await authService.register(input)
      setUser(u)
      return u
    },
    logout: async () => {
      await authService.logout()
      setUser(null)
    },
  }

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải nằm trong AuthProvider')
  return ctx
}
