import { AlertTriangle, ClipboardList, Package, Users, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { OrderStatusBadge } from '../../components/common/Misc'
import { ErrorState, Spinner } from '../../components/common/States'
import { AdminPageTitle } from '../../components/layout/AdminLayout'
import { useAsync } from '../../hooks/useAsync'
import { formatDateTime, formatVND } from '../../lib/format'
import { ORDER_STATUS_LABEL } from '../../lib/orderStatus'
import { getDashboard } from '../../services/adminService'

function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue))
  return (
    <div>
      <div className="flex h-48 items-end gap-3 border-b border-slate-200">
        {data.map((d) => (
          <div key={d.date} className="group relative flex h-full flex-1 items-end justify-center">
            <div className="w-full max-w-10 rounded-t bg-brand-600 transition group-hover:bg-brand-800" style={{ height: `${Math.max(d.revenue ? 4 : 0, (d.revenue / max) * 100)}%` }} />
            <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded-md bg-ink px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
              {new Date(d.date).toLocaleDateString('vi-VN')}: {formatVND(d.revenue)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((d) => (
          <span key={d.date} className="flex-1 text-center text-xs text-slate-500">{new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data, loading, error, reload } = useAsync(getDashboard, [])
  if (loading) return <Spinner />
  if (error || !data) return <ErrorState message={error ?? ''} onRetry={reload} />

  const stats = [
    { label: 'Doanh thu (đơn hoàn thành)', value: formatVND(data.revenue), icon: Wallet },
    { label: 'Tổng đơn hàng', value: data.totalOrders, sub: `${data.pendingOrders} chờ xác nhận`, icon: ClipboardList },
    { label: 'Sản phẩm đang bán', value: data.products, icon: Package },
    { label: 'Khách hàng', value: data.customers, icon: Users },
  ]

  return (
    <>
      <AdminPageTitle title="Dashboard" subtitle="Tổng quan hoạt động cửa hàng" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <Icon className="size-5 text-brand-700" />
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
            {sub && <p className="text-xs text-amber-600">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="card p-5">
          <h2 className="font-semibold">Doanh thu 7 ngày gần nhất</h2>
          <p className="mb-4 text-xs text-slate-500">Chỉ tính đơn đã hoàn thành (theo ngày hoàn thành); không tính đơn đã hủy.</p>
          <RevenueChart data={data.revenueLast7Days} />
        </div>
        <div className="card p-5">
          <h2 className="mb-3 font-semibold">Đơn hàng theo trạng thái</h2>
          <ul className="space-y-2 text-sm">
            {data.statusCounts.map((s) => (
              <li key={s.status}>
                <Link to={`/admin/don-hang?status=${s.status}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-surface">
                  <span>{ORDER_STATUS_LABEL[s.status]}</span>
                  <b>{s.count}</b>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Đơn hàng mới nhất</h2>
            <Link to="/admin/don-hang" className="text-sm text-brand-700 hover:underline">Xem tất cả</Link>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {data.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="py-2"><Link to={`/admin/don-hang/${o.code}`} className="font-semibold text-brand-700">{o.code}</Link><p className="text-xs text-slate-500">{formatDateTime(o.createdAt)}</p></td>
                  <td className="py-2"><OrderStatusBadge status={o.status} /></td>
                  <td className="py-2 text-right font-semibold">{formatVND(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold"><AlertTriangle className="size-4 text-amber-500" /> Sắp hết / hết hàng (≤ 5)</h2>
            <Link to="/admin/ton-kho" className="text-sm text-brand-700 hover:underline">Quản lý tồn kho</Link>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-slate-500">Không có sản phẩm sắp hết hàng.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {data.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="line-clamp-1">{p.code} — {p.name}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>{p.stock === 0 ? 'Hết hàng' : `Còn ${p.stock}`}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
