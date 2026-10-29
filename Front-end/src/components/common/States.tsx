import { AlertTriangle, Loader2, PackageOpen, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Spinner({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
      <Loader2 className="size-5 animate-spin text-brand-700" />
      {label}
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse p-3">
          <div className="aspect-[4/3] rounded-lg bg-slate-200" />
          <div className="mt-3 h-3 w-1/3 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-full rounded bg-slate-200" />
          <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
          <div className="mt-4 h-5 w-1/2 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-surface/50 px-6 py-14 text-center">
      <PackageOpen className="size-12 text-slate-400" />
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <AlertTriangle className="size-10 text-red-500" />
      <h3 className="mt-3 font-semibold text-red-800">Không thể tải dữ liệu</h3>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry && (
        <button className="btn-outline mt-4" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  )
}

export function Forbidden() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <ShieldAlert className="size-14 text-amber-500" />
        <h1 className="mt-4 text-2xl font-bold">Không có quyền truy cập</h1>
        <p className="mt-2 text-sm text-slate-500">Tài khoản của bạn không được phép truy cập khu vực này.</p>
        <Link to="/" className="btn-primary mt-6">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
