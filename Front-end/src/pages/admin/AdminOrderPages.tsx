import { AlertTriangle, Loader2, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/common/Misc'
import { EmptyState, ErrorState, Spinner } from '../../components/common/States'
import { ProductImage } from '../../components/product/ProductCard'
import { AdminPageTitle } from '../../components/layout/AdminLayout'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { classNames, formatDateTime, formatVND } from '../../lib/format'
import { ORDER_STATUS_LABEL, ORDER_TRANSITIONS, PAYMENT_STATUS_LABEL } from '../../lib/orderStatus'
import { getOrder, listOrders, updateOrderStatus, updatePaymentStatus } from '../../services/adminService'
import type { OrderStatus, PaymentStatus } from '../../types'
import { OrderTimeline } from '../account/AccountPages'

const STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]

export function AdminOrders() {
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') ?? '') as OrderStatus | ''
  const { data, loading, error, reload } = useAsync(() => listOrders(status), [status])
  const [q, setQ] = useState('')

  const rows = (data ?? []).filter((o) => {
    const t = q.trim().toLowerCase()
    return !t || o.code.toLowerCase().includes(t) || o.shipping.phone.includes(t) || o.shipping.fullName.toLowerCase().includes(t)
  })

  return (
    <>
      <AdminPageTitle title="Quản lý đơn hàng" />
      <div className="mb-4 flex flex-wrap gap-2">
        {[{ v: '', l: 'Tất cả' }, ...STATUSES.map((s) => ({ v: s, l: ORDER_STATUS_LABEL[s] }))].map((t) => (
          <button key={t.v} onClick={() => setParams(t.v ? { status: t.v } : {})} className={classNames('rounded-full px-4 py-1.5 text-sm font-medium', status === t.v ? 'bg-brand-700 text-white' : 'bg-white text-slate-600')}>{t.l}</button>
        ))}
      </div>
      <div className="card mb-4 p-3">
        <div className="relative">
          <Search className="absolute top-3 left-3 size-4 text-slate-400" />
          <input className="input pl-9" placeholder="Tìm theo mã đơn, tên hoặc SĐT người nhận" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState title="Không có đơn hàng" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-surface text-left text-xs text-slate-500 uppercase">
              <tr><th className="px-4 py-3">Mã đơn</th><th className="px-4 py-3">Khách hàng</th><th className="px-4 py-3">Ngày đặt</th><th className="px-4 py-3 text-right">Tổng tiền</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Thanh toán</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3"><Link to={`/admin/don-hang/${o.code}`} className="font-semibold text-brand-700 hover:underline">{o.code}</Link></td>
                  <td className="px-4 py-3"><p>{o.shipping.fullName}</p><p className="text-xs text-slate-500">{o.shipping.phone}</p></td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatVND(o.total)}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-4 py-3"><PaymentStatusBadge status={o.paymentStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export function AdminOrderDetail() {
  const { code = '' } = useParams()
  const toast = useToast()
  const { data, loading, error, reload } = useAsync(() => getOrder(code), [code])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) return <Spinner />
  if (error || !data) return <ErrorState message={error ?? ''} onRetry={reload} />
  const { order, customer, stock } = data
  const next = ORDER_TRANSITIONS[order.status]

  const changeStatus = async (s: OrderStatus) => {
    const msg = s === 'CANCELLED' ? 'Hủy đơn này? Tồn kho sẽ được hoàn lại.' : `Chuyển đơn sang "${ORDER_STATUS_LABEL[s]}"?`
    if (!confirm(msg)) return
    setBusy(true)
    try {
      await updateOrderStatus(order.code, s, note)
      toast.success(`Đã cập nhật: ${ORDER_STATUS_LABEL[s]}`)
      setNote('')
      reload()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const changePayment = async (p: PaymentStatus) => {
    try {
      await updatePaymentStatus(order.code, p)
      toast.success('Đã cập nhật trạng thái thanh toán')
      reload()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <>
      <Link to="/admin/don-hang" className="text-sm text-brand-700 hover:underline">← Danh sách đơn hàng</Link>
      <AdminPageTitle
        title={`Đơn hàng ${order.code}`}
        subtitle={`Đặt lúc ${formatDateTime(order.createdAt)}`}
        action={<div className="flex gap-2"><OrderStatusBadge status={order.status} /><PaymentStatusBadge status={order.paymentStatus} /></div>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="card p-5"><OrderTimeline order={order} /></div>

          <div className="card p-5">
            <h2 className="mb-3 font-semibold">Sản phẩm & kiểm tra tồn kho</h2>
            <ul className="divide-y divide-slate-100">
              {order.items.map((i) => (
                <li key={i.productId} className="flex items-center gap-3 py-3 text-sm">
                  <ProductImage src={i.image} alt="" className="size-12 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium">{i.productName}</p>
                    <p className="text-xs text-slate-500">{i.productCode} · {formatVND(i.unitPrice)} × {i.quantity}</p>
                    <p className="text-xs text-slate-500">Tồn kho hiện tại: <b>{stock[i.productId]}</b> (đã trừ {i.quantity} cho đơn này{order.stockReleased ? ' — đã hoàn lại' : ''})</p>
                  </div>
                  <span className="font-semibold">{formatVND(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 ml-auto max-w-xs space-y-1 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Giảm giá</span><span>-{formatVND(order.discountTotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Phí vận chuyển</span><span>{formatVND(order.shippingFee)}</span></div>
              <div className="flex justify-between font-bold"><span>Tổng</span><span className="text-red-600">{formatVND(order.total)}</span></div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-semibold">Lịch sử xử lý</h2>
            <ul className="space-y-2 text-sm">
              {[...order.history].reverse().map((h, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="w-36 shrink-0 text-xs text-slate-500">{formatDateTime(h.at)}</span>
                  <span><b>{ORDER_STATUS_LABEL[h.status]}</b>{h.note && <span className="text-slate-600"> — {h.note}</span>}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-3 font-semibold">Cập nhật trạng thái đơn</h2>
            {next.length === 0 ? (
              <p className="text-sm text-slate-500">Đơn đã ở trạng thái cuối, không thể thay đổi.</p>
            ) : (
              <>
                <textarea className="input mb-3" rows={2} placeholder="Ghi chú (VD: lý do hủy, mã vận đơn...)" value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="flex flex-col gap-2">
                  {next.map((s) => (
                    <button key={s} disabled={busy} onClick={() => changeStatus(s)} className={s === 'CANCELLED' ? 'btn-outline border-red-300 text-red-600 hover:border-red-600 hover:text-red-700' : 'btn-primary'}>
                      {busy && <Loader2 className="size-4 animate-spin" />}
                      {s === 'CANCELLED' ? 'Hủy đơn hàng' : `Chuyển sang: ${ORDER_STATUS_LABEL[s]}`}
                    </button>
                  ))}
                </div>
                {order.status === 'PENDING' && (
                  <p className="mt-3 flex gap-1.5 text-xs text-slate-500"><AlertTriangle className="size-4 shrink-0 text-amber-500" /> Kiểm tra thông tin người nhận và tồn kho trước khi xác nhận. Nếu thông tin không hợp lệ, hãy hủy đơn kèm lý do.</p>
                )}
              </>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-semibold">Thanh toán (COD)</h2>
            <select className="input" value={order.paymentStatus} onChange={(e) => changePayment(e.target.value as PaymentStatus)}>
              {(Object.keys(PAYMENT_STATUS_LABEL) as PaymentStatus[]).map((p) => <option key={p} value={p}>{PAYMENT_STATUS_LABEL[p]}</option>)}
            </select>
            <p className="mt-2 text-xs text-slate-500">Quản lý riêng với trạng thái đơn. Hệ thống tự ghi nhận "Đã thanh toán" khi đơn COD hoàn thành.</p>
          </div>

          <div className="card p-5 text-sm">
            <h2 className="mb-2 font-semibold">Người nhận</h2>
            <p>{order.shipping.fullName}</p>
            <p>{order.shipping.phone}</p>
            <p className="text-slate-600">{order.shipping.address}, {order.shipping.district}, {order.shipping.province}</p>
            {order.shipping.note && <p className="mt-1 text-slate-500">Ghi chú: {order.shipping.note}</p>}
            {customer && (
              <>
                <h2 className="mt-4 mb-1 font-semibold">Tài khoản đặt hàng</h2>
                <p>{customer.fullName} · {customer.email}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
