/**
 * Client gọi REST API NestJS (Back-end).
 * Mặc định gọi "/api" — Vite dev server proxy sang http://localhost:3000 (xem vite.config.ts).
 * Có thể đổi bằng biến môi trường VITE_API_URL (VD: https://api.gicungco.vn/api).
 */
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '/api'

const TOKEN_KEY = 'gicungco_token'

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type Query = Record<string, string | number | boolean | string[] | undefined | null>

const toSearch = (query?: Query) => {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === '' || v === false) continue
    if (Array.isArray(v)) {
      if (v.length) params.set(k, v.join(','))
    } else params.set(k, v === true ? '1' : String(v))
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

export async function request<T>(method: string, path: string, options: { body?: unknown; query?: Query } = {}): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(BASE_URL + path + toSearch(options.query), {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Vui lòng kiểm tra Back-end đã chạy chưa.')
  }

  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!res.ok) {
    // Token hết hạn / không hợp lệ → xóa để giao diện về trạng thái chưa đăng nhập
    if (res.status === 401) setToken(null)
    const msg = (data as { message?: string | string[] } | null)?.message
    throw new ApiError(res.status, (Array.isArray(msg) ? msg[0] : msg) || `Lỗi ${res.status}`)
  }
  return data as T
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body: body ?? {} }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body: body ?? {} }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body: body ?? {} }),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
