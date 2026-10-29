import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { ErrorState, Spinner } from '../../components/common/States'
import { AdminPageTitle } from '../../components/layout/AdminLayout'
import { usePricing } from '../../context/PricingContext'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { formatDate, formatVND } from '../../lib/format'
import { getPromotionSettings, listCustomers, listProducts, updatePromotion, updateSettings } from '../../services/adminService'
import type { Product, Promotion } from '../../types'

// ======================= KHÁCH HÀNG (nâng cao) =======================

export function AdminCustomers() {
  const { data, loading, error, reload } = useAsync(listCustomers, [])
  if (loading) return <Spinner />
  if (error || !data) return <ErrorState message={error ?? ''} onRetry={reload} />
  return (
    <>
      <AdminPageTitle title="Quản lý khách hàng" subtitle={`${data.length} khách hàng`} />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface text-left text-xs text-slate-500 uppercase">
            <tr><th className="px-4 py-3">Khách hàng</th><th className="px-4 py-3">Số điện thoại</th><th className="px-4 py-3">Ngày đăng ký</th><th className="px-4 py-3 text-right">Số đơn</th><th className="px-4 py-3 text-right">Đã mua (hoàn thành)</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3"><p className="font-medium">{c.fullName}</p><p className="text-xs text-slate-500">{c.email}</p></td>
                <td className="px-4 py-3">{c.phone}</td>
                <td className="px-4 py-3">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3 text-right">{c.orderCount}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatVND(c.totalSpent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ======================= KHUYẾN MÃI (nâng cao) =======================

function PromotionEditor({ promo, products, onSaved }: { promo: Promotion; products: Product[]; onSaved: () => void }) {
  const toast = useToast()
  const [f, setF] = useState(promo)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const { id: _id, type: _type, ...input } = f
      await updatePromotion(promo.id, input)
      toast.success('Đã lưu chương trình khuyến mãi')
      onSaved()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">{promo.type === 'PRODUCT_PERCENT' ? 'Giảm giá theo sản phẩm' : 'Miễn phí vận chuyển'}</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-brand-700" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /> Đang bật
        </label>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="label">Tên chương trình</label><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="label">Ngày bắt đầu</label><input type="date" className="input" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></div>
        <div><label className="label">Ngày kết thúc</label><input type="date" className="input" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} /></div>
        {promo.type === 'PRODUCT_PERCENT' ? (
          <div><label className="label">Phần trăm giảm (%)</label><input type="number" min={1} max={99} className="input" value={f.value} onChange={(e) => setF({ ...f, value: Number(e.target.value) })} /></div>
        ) : (
          <div><label className="label">Ngưỡng đơn tối thiểu (đ)</label><input type="number" min={0} step={100000} className="input" value={f.minOrderValue} onChange={(e) => setF({ ...f, minOrderValue: Number(e.target.value) })} /></div>
        )}
      </div>
      {promo.type === 'PRODUCT_PERCENT' && (
        <div className="mt-4">
          <p className="label">Sản phẩm áp dụng ({f.productIds.length})</p>
          <div className="grid max-h-64 gap-1 overflow-y-auto rounded-lg border border-slate-200 p-2 sm:grid-cols-2">
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-surface">
                <input
                  type="checkbox"
                  className="size-4 accent-brand-700"
                  checked={f.productIds.includes(p.id)}
                  onChange={() => setF({ ...f, productIds: f.productIds.includes(p.id) ? f.productIds.filter((x) => x !== p.id) : [...f.productIds, p.id] })}
                />
                <span className="line-clamp-1">{p.code} — {p.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <button className="btn-primary mt-4" disabled={saving} onClick={save}>{saving && <Loader2 className="size-4 animate-spin" />} Lưu chương trình</button>
    </div>
  )
}

export function AdminPromotions() {
  const toast = useToast()
  const pricing = usePricing()
  const data = useAsync(getPromotionSettings, [])
  const products = useAsync(listProducts, [])
  const [fee, setFee] = useState<string | null>(null)

  if (data.loading || products.loading) return <Spinner />
  if (data.error || !data.data) return <ErrorState message={data.error ?? ''} onRetry={data.reload} />

  const saved = () => {
    data.reload()
    pricing.reload()
  }

  return (
    <>
      <AdminPageTitle title="Khuyến mãi & phí vận chuyển" subtitle="Giá cuối cùng luôn được tính lại ở server khi tạo đơn." />
      <div className="card mb-6 flex flex-wrap items-end gap-3 p-5">
        <div>
          <label className="label">Phí vận chuyển cố định (đ/đơn)</label>
          <input type="number" min={0} step={1000} className="input w-48" value={fee ?? data.data.settings.baseShippingFee} onChange={(e) => setFee(e.target.value)} />
        </div>
        <button
          className="btn-primary"
          disabled={fee === null}
          onClick={async () => {
            try {
              await updateSettings({ baseShippingFee: Number(fee) })
              toast.success('Đã lưu phí vận chuyển')
              setFee(null)
              saved()
            } catch (e) {
              toast.error((e as Error).message)
            }
          }}
        >
          Lưu
        </button>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {data.data.promotions.map((p) => (
          <PromotionEditor key={p.id + JSON.stringify(p)} promo={p} products={products.data ?? []} onSaved={saved} />
        ))}
      </div>
    </>
  )
}
