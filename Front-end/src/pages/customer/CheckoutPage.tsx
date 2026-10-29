import { Banknote, Loader2, MapPin } from 'lucide-react'
import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Breadcrumb } from '../../components/common/Misc'
import { OrderSummary } from '../../components/product/OrderSummary'
import { ProductImage } from '../../components/product/ProductCard'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { classNames, formatVND } from '../../lib/format'
import { createOrder } from '../../services/orderService'
import { quoteCart } from '../../services/promotionService'
import type { ShippingInfo } from '../../types'

const PROVINCES = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Thừa Thiên Huế', 'Tỉnh/thành khác']

type Errors = Partial<Record<keyof ShippingInfo, string>>

export function validateShipping(s: ShippingInfo): Errors {
  const e: Errors = {}
  if (s.fullName.trim().length < 2) e.fullName = 'Vui lòng nhập họ tên người nhận'
  if (!/^0\d{9}$/.test(s.phone.trim())) e.phone = 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0'
  if (!s.province) e.province = 'Vui lòng chọn tỉnh/thành phố'
  if (!s.district.trim()) e.district = 'Vui lòng nhập quận/huyện'
  if (s.address.trim().length < 5) e.address = 'Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường...)'
  return e
}

export default function CheckoutPage() {
  const { user } = useAuth()
  const cart = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const buyNowMode = params.get('mode') === 'buy-now' && cart.buyNow

  const items = buyNowMode ? [cart.buyNow!] : cart.lines.filter((l) => cart.selected.includes(l.productId))
  const quote = useAsync(() => quoteCart(items), [JSON.stringify(items)])

  const [form, setForm] = useState<ShippingInfo>({
    fullName: user?.fullName ?? '',
    phone: user?.phone ?? '',
    province: '',
    district: '',
    address: user?.address ?? '',
    note: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  // Đánh dấu đã đặt hàng để không bị chuyển về giỏ hàng khi giỏ vừa được làm trống
  const placed = useRef(false)

  if (items.length === 0) return placed.current ? null : <Navigate to="/gio-hang" replace />

  const set = (k: keyof ShippingInfo) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validateShipping(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast.error('Vui lòng kiểm tra lại thông tin nhận hàng')
      return
    }
    setSubmitting(true)
    setServerError('')
    try {
      const order = await createOrder({ items, shipping: form })
      placed.current = true
      navigate(`/dat-hang-thanh-cong/${order.code}`, { replace: true })
      if (buyNowMode) cart.setBuyNow(null)
      else items.forEach((i) => cart.remove(i.productId))
    } catch (err) {
      setServerError((err as Error).message)
      quote.reload()
    } finally {
      setSubmitting(false)
    }
  }

  const field = (k: keyof ShippingInfo, label: string, input: ReactNode) => (
    <div>
      <label className="label" htmlFor={k}>{label}</label>
      {input}
      {errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>}
    </div>
  )

  return (
    <div className="container-page py-6">
      <Breadcrumb items={[{ label: 'Giỏ hàng', to: '/gio-hang' }, { label: 'Thanh toán' }]} />
      <h1 className="mt-3 text-2xl font-bold">Thanh toán</h1>

      <form onSubmit={submit} noValidate className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold"><MapPin className="size-5 text-brand-700" /> Thông tin nhận hàng</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {field('fullName', 'Họ và tên người nhận *', <input id="fullName" className={classNames('input', errors.fullName && 'input-error')} value={form.fullName} onChange={set('fullName')} />)}
              {field('phone', 'Số điện thoại *', <input id="phone" inputMode="tel" className={classNames('input', errors.phone && 'input-error')} value={form.phone} onChange={set('phone')} placeholder="0912345678" />)}
              {field(
                'province',
                'Tỉnh/Thành phố *',
                <select id="province" className={classNames('input', errors.province && 'input-error')} value={form.province} onChange={set('province')}>
                  <option value="">-- Chọn tỉnh/thành --</option>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>,
              )}
              {field('district', 'Quận/Huyện *', <input id="district" className={classNames('input', errors.district && 'input-error')} value={form.district} onChange={set('district')} />)}
              <div className="sm:col-span-2">
                {field('address', 'Địa chỉ cụ thể *', <input id="address" className={classNames('input', errors.address && 'input-error')} value={form.address} onChange={set('address')} placeholder="Số nhà, tên đường, phường/xã" />)}
              </div>
              <div className="sm:col-span-2">
                {field('note', 'Ghi chú (không bắt buộc)', <textarea id="note" rows={2} className="input" value={form.note} onChange={set('note')} placeholder="VD: Giao giờ hành chính" />)}
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Banknote className="size-5 text-brand-700" /> Phương thức thanh toán</h2>
            <label className="mt-4 flex items-start gap-3 rounded-lg border-2 border-brand-700 bg-brand-50 p-4">
              <input type="radio" checked readOnly className="mt-1 size-4 accent-brand-700" />
              <span>
                <span className="block font-semibold">Thanh toán khi nhận hàng (COD)</span>
                <span className="block text-sm text-slate-600">Bạn thanh toán bằng tiền mặt cho nhân viên giao hàng sau khi kiểm tra sản phẩm.</span>
              </span>
            </label>
          </section>

          <section className="card p-5">
            <h2 className="text-lg font-bold">Sản phẩm ({items.length})</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {quote.data?.lines.map((l) => (
                <li key={l.product.id} className="flex items-center gap-3 py-3">
                  <ProductImage src={l.product.images[0]} alt={l.product.name} className="size-14 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{l.product.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatVND(l.unitPrice)} × {l.quantity}
                      {l.discountPercent > 0 && <span className="ml-2 text-emerald-700">(-{l.discountPercent}%)</span>}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{formatVND(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="lg:sticky lg:top-40 lg:self-start">
          <OrderSummary quote={quote.data} title="Đơn hàng">
            {serverError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
            <button type="submit" className="btn-primary mt-5 w-full py-3.5 text-base" disabled={submitting || !quote.data}>
              {submitting && <Loader2 className="size-4 animate-spin" />} Xác nhận đặt hàng
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">
              Bằng việc đặt hàng, bạn đồng ý với <Link to="/chinh-sach/doi-tra" className="underline">chính sách đổi trả</Link> của GICUNGCO.
            </p>
          </OrderSummary>
        </div>
      </form>
    </div>
  )
}
