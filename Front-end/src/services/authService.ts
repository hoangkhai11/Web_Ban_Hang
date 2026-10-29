import type { User } from '../types'
import { api, getToken, setToken } from './api'

export { getToken }

interface AuthResponse {
  accessToken: string
  user: User
}

export interface RegisterInput {
  fullName: string
  email: string
  phone: string
  password: string
}

/** POST /api/auth/register */
export async function register(input: RegisterInput) {
  const res = await api.post<AuthResponse>('/auth/register', input)
  setToken(res.accessToken)
  return res.user
}

/** POST /api/auth/login — admin=true dùng cho trang đăng nhập quản trị */
export async function login(email: string, password: string, admin = false) {
  const res = await api.post<AuthResponse>('/auth/login', { email, password, admin })
  setToken(res.accessToken)
  return res.user
}

/** POST /api/auth/logout (JWT: phía client xóa token) */
export async function logout() {
  setToken(null)
  await api.post('/auth/logout').catch(() => undefined)
}

/** GET /api/auth/me — null nếu chưa đăng nhập hoặc token hết hạn */
export async function me(): Promise<User | null> {
  if (!getToken()) return null
  try {
    return await api.get<User>('/auth/me')
  } catch {
    return null
  }
}

/** PATCH /api/auth/me */
export function updateProfile(input: { fullName: string; phone: string; address: string }) {
  return api.patch<User>('/auth/me', input)
}

/** POST /api/auth/forgot-password (nâng cao) — demo: không gửi email thật */
export function forgotPassword(email: string) {
  return api.post<{ message: string }>('/auth/forgot-password', { email })
}
