import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Forbidden, Spinner } from '../common/States'

/** Yêu cầu đăng nhập — chuyển về trang đăng nhập và quay lại sau khi đăng nhập. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <Spinner />
  if (!user) return <Navigate to="/dang-nhap" replace state={{ from: location.pathname + location.search }} />
  return <>{children}</>
}

/**
 * Bảo vệ giao diện Admin. Lưu ý: đây chỉ là lớp giao diện —
 * mọi API Admin đều tự kiểm tra quyền ở phía service/Back-end.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth()
  if (!ready) return <Spinner />
  if (!user) return <Navigate to="/admin/dang-nhap" replace />
  if (user.role !== 'ADMIN') return <Forbidden />
  return <>{children}</>
}
