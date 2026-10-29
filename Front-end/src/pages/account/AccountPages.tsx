import { CheckCircle2, ClipboardList, Loader2, User as UserIcon, XCircle } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { Breadcrumb, OrderStatusBadge, PaymentStatusBadge } from '../../components/common/Misc'
import { EmptyState, ErrorState, Spinner } from '../../components/common/States'
import { ProductImage } from '../../components/product/ProductCard'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { classNames, formatDateTime, formatVND } from '../../lib/format'
import { ORDER_FLOW, ORDER_STATUS_LABEL } from '../../lib/orderStatus'
import { updateProfile } from '../../services/authService'
import { cancelMyOrder, getMyOrder, getMyOrders } from '../../services/orderService'
import type { Order } from '../../types'

export function AccountLayout() {
  const { user } = useAuth()
  const link = ({ isActive }: { isActive: boolean }) =>
    classNames('flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium', isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-surface')
  return (
    <div className="container-page py-6">
      <Breadcrumb items={[{ label: 'Tài khoản' }]} />
      <div className="mt-4 grid gap-6 md:grid-cols-[240px_1fr]">
        <aside className="card h-fit p-3">
          <div className="flex items-center gap-3 border-b border-slate-100 px-2 pb-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800">{user?.fullName.charAt(0)}</span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{user?.fullName}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <nav className="mt-2 space-y-1">
            <NavLink to="/tai-khoan" end className={link}><UserIcon className="size-4" /> Thông tin cá nhân</NavLink>
            <NavLink to="/tai-khoan/don-hang" className={link}><ClipboardList className="size-4" /> Đơn hàng của tôi</NavLink>
          </nav>
        </aside>
        <section><Outlet /></section>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ fullName: user?.fullName ?? '', phone: user?.phone ?? '', address: user?.address ?? '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (form.fullName.trim().length < 2) return setError('Vui lòng nhập họ tên')
    if (!/^0\d{9}$/.test(form.phone)) return setError('Số điện thoại gồm 10 chữ số, bắt đầu bằng 0')
    setError('')
    setSaving(true)
    try {
      setUser(await updateProfile(form))
      toast.success('Đã cập nhật thông tin cá nhân')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-5 md:p-6">
      <h1 className="text-xl font-bold">Thông tin cá nhân</h1>
      <form onSubmit={submit} noValidate className="mt-5 grid max-w-xl gap-4">
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div>
          <label className="label">Email (không thể thay đổi)</label>
          <input className="input bg-surface" value={user?.email ?? ''} disabled />
        </div>
        <div>
          <label className="label" htmlFor="fullName">Họ và tên</label>
          <input id="fullName" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="phone">Số điện thoại</label>
          <input id="phone" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="address">Địa chỉ mặc định</label>
          <input id="address" className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <button className="btn-primary w-fit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />} Lưu thay đổi
        </button>
      </form>
    </div>
  )
}

export function MyOrdersPage() {
  const { data, loading, error, reload } = useAsync(getMyOrders, [])
  if (loading) return <Spinner />
  if (error) return <ErrorState message={error} onRetry={reload} />
  if (!data?.length) return <EmptyState title="Bạn chưa có đơn hàng nào" action={<Link to="/" className="btn-primary">Mua sắm ngay</Link>} />

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Đơn hàng của tôi</h1>
      {data.map((o) => (
        <Link key={o.id} to={`/tai-khoan/don-hang/${o.code}`} className="card block p-4 transition hover:border-brand-700">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="text-sm">
              <b className="text-brand-700">{o.code}</b>
              <span className="ml-2 text-slate-500">{formatDateTime(o.createdAt)}</span>
            </div>
            <div className="flex gap-2">
              <OrderStatusBadge status={o.status} />
              <PaymentStatusBadge status={o.paymentStatus} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <ProductImage src={o.items[0].image} alt="" className="size-14 rounded object-cover" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="line-clamp-1 font-medium">{o.items[0].productName}</p>
              {o.items.length > 1 && <p className="text-xs text-slate-500">và {o.items.length - 1} sản phẩm khác</p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Tổng tiền</p>
              <p className="font-bold text-red-600">{formatVND(o.total)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === 'CANCELLED') {
    const at = order.history.find((h) => h.status === 'CANCELLED')
    return (
      <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
        <XCircle className="size-6 shrink-0" />
        <div>
          <p className="font-semibold">Đơn hàng đã bị hủy</p>
          {at && <p className="text-xs">{formatDateTime(at.at)}{at.note && ` — ${at.note}`}</p>}
        </div>
      </div>
    )
  }
  const current = ORDER_FLOW.indexOf(order.status)
  return (
    <ol className="grid grid-cols-5 gap-1">
      {ORDER_FLOW.map((s, i) => {
        const h = order.history.find((x) => x.status === s)
        const done = i <= current
        return (
          <li key={s} className="flex flex-col items-center text-center">
            <div className="flex w-full items-center">
              <span className={classNames('h-0.5 flex-1', i === 0 ? 'invisible' : done ? 'bg-brand-600' : 'bg-slate-200')} />
              <span className={classNames('flex size-8 shrink-0 items-center justify-center rounded-full', done ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-400')}>
                <CheckCircle2 className="size-4" />
              </span>
              <span className={classNames('h-0.5 flex-1', i === ORDER_FLOW.length - 1 ? 'invisible' : i < current ? 'bg-brand-600' : 'bg-slate-200')} />
            </div>
            <p className={classNames('mt-2 text-[11px] font-semibold md:text-xs', done ? 'text-brand-800' : 'text-slate-400')}>{ORDER_STATUS_LABEL[s]}</p>
            {h && <p className="text-[10px] text-slate-500 md:text-xs">{formatDateTime(h.at)}</p>}
          </li>
        )
      })}
    </ol>
  )
}

export function MyOrderDetailPage() {
  const { code = '' } = useParams()
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAsync(() => getMyOrder(code), [code])
  const [cancelling, setCancelling] = useState(false)

  if (loading) return <Spinner />
  if (error || !data) return <ErrorState message={error ?? ''} onRetry={reload} />

  const cancel = async () => {
    if (!confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return
    setCancelling(true)
    try {
      setData(await cancelMyOrder(code))
      toast.success('Đã hủy đơn hàng')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link to="/tai-khoan/don-hang" className="text-sm text-brand-700 hover:underline">← Đơn hàng của tôi</Link>
          <h1 className="mt-1 text-xl font-bold">Đơn hàng {data.code}</h1>
          <p className="text-sm text-slate-500">Đặt lúc {formatDateTime(data.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={data.status} />
          <PaymentStatusBadge status={data.paymentStatus} />
          <button className="btn-ghost text-sm" onClick={reload}>Làm mới</button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 font-semibold">Theo dõi trạng thái</h2>
        <OrderTimeline order={data} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5 text-sm">
          <h2 className="mb-2 font-semibold">Thông tin nhận hàng</h2>
          <p>{data.shipping.fullName} — {data.shipping.phone}</p>
          <p className="text-slate-600">{data.shipping.address}, {data.shipping.district}, {data.shipping.province}</p>
          {data.shipping.note && <p className="mt-1 text-slate-500">Ghi chú: {data.shipping.note}</p>}
        </div>
        <div className="card p-5 text-sm">
          <h2 className="mb-2 font-semibold">Thanh toán</h2>
          <p>Thanh toán khi nhận hàng (COD)</p>
          <p className="mt-1 text-slate-600">Trạng thái: <PaymentStatusBadge status={data.paymentStatus} /></p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-2 font-semibold">Sản phẩm</h2>
        <ul className="divide-y divide-slate-100">
          {data.items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3 py-3 text-sm">
              <ProductImage src={i.image} alt="" className="size-14 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium">{i.productName}</p>
                <p className="text-xs text-slate-500">{i.productCode} · {formatVND(i.unitPrice)} × {i.quantity}</p>
              </div>
              <span className="font-semibold">{formatVND(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 ml-auto max-w-xs space-y-1.5 border-t border-slate-100 pt-3 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><span>{formatVND(data.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Giảm giá</span><span className="text-emerald-700">-{formatVND(data.discountTotal)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Phí vận chuyển</span><span>{data.shippingFee === 0 ? 'Miễn phí' : formatVND(data.shippingFee)}</span></div>
          <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold"><span>Tổng thanh toán</span><span className="text-lg text-red-600">{formatVND(data.total)}</span></div>
        </div>
      </div>

      {data.status === 'PENDING' && (
        <div className="flex justify-end">
          <button className="btn-outline border-red-300 text-red-600 hover:border-red-600 hover:text-red-700" onClick={cancel} disabled={cancelling}>
            {cancelling && <Loader2 className="size-4 animate-spin" />} Hủy đơn hàng
          </button>
        </div>
      )}
    </div>
  )
}
