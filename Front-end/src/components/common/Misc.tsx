import { ChevronLeft, ChevronRight, ChevronRight as Sep, Minus, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { classNames } from '../../lib/format'
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, PAYMENT_STATUS_COLOR, PAYMENT_STATUS_LABEL } from '../../lib/orderStatus'
import type { OrderStatus, PaymentStatus } from '../../types'

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
      <Link to="/" className="hover:text-brand-700">
        Trang chủ
      </Link>
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          <Sep className="size-3" />
          {c.to ? (
            <Link to={c.to} className="hover:text-brand-700">
              {c.label}
            </Link>
          ) : (
            <span className="font-medium text-ink">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const btn = 'flex size-9 items-center justify-center rounded-lg text-sm font-medium transition'
  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Phân trang">
      <button className={classNames(btn, 'hover:bg-slate-100 disabled:opacity-40')} disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Trang trước">
        <ChevronLeft className="size-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={classNames(btn, p === page ? 'bg-brand-700 text-white' : 'hover:bg-slate-100')}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}
      <button className={classNames(btn, 'hover:bg-slate-100 disabled:opacity-40')} disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Trang sau">
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}

export function QuantityInput({ value, onChange, max, min = 1 }: { value: number; onChange: (v: number) => void; max: number; min?: number }) {
  return (
    <div className="inline-flex h-9 items-center rounded-lg border border-slate-300">
      <button type="button" className="flex h-full w-9 items-center justify-center text-slate-600 hover:text-brand-700 disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Giảm">
        <Minus className="size-4" />
      </button>
      <input
        type="number"
        className="h-full w-12 border-x border-slate-300 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)))
        }}
        aria-label="Số lượng"
      />
      <button type="button" className="flex h-full w-9 items-center justify-center text-slate-600 hover:text-brand-700 disabled:opacity-40" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Tăng">
        <Plus className="size-4" />
      </button>
    </div>
  )
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={classNames('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', ORDER_STATUS_COLOR[status])}>{ORDER_STATUS_LABEL[status]}</span>
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={classNames('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', PAYMENT_STATUS_COLOR[status])}>{PAYMENT_STATUS_LABEL[status]}</span>
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="text-xs font-semibold text-red-600">● Hết hàng</span>
  if (stock <= 5) return <span className="text-xs font-semibold text-amber-600">● Chỉ còn {stock} sản phẩm</span>
  return <span className="text-xs font-semibold text-emerald-600">● Còn hàng</span>
}

export function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-1 text-xl font-bold md:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function Modal({ open, title, onClose, children, wide }: { open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 md:items-center" onMouseDown={onClose}>
      <div className={classNames('w-full rounded-xl bg-white shadow-xl', wide ? 'max-w-3xl' : 'max-w-md')} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold">{title}</h3>
          <button className="text-slate-400 hover:text-slate-700" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
