import { ArrowLeft, ArrowRight, Gift, Lock, Trash2, Truck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Breadcrumb, QuantityInput, StockBadge } from '../../components/common/Misc'
import { EmptyState, Spinner } from '../../components/common/States'
import { OrderSummary } from '../../components/product/OrderSummary'
import { PriceTag, ProductImage } from '../../components/product/ProductCard'
import { CART_MAX_QTY, useCart } from '../../context/CartContext'
import { usePricing } from '../../context/PricingContext'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { formatVND } from '../../lib/format'
import { getProductsByIds, getSuggestedAccessories } from '../../services/catalogService'
import { quoteCart } from '../../services/promotionService'

export default function CartPage() {
  const cart = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  const { priceOf, freeShippingThreshold } = usePricing()
  const ids = cart.lines.map((l) => l.productId)

  const products = useAsync(() => getProductsByIds(ids), [ids.join(',')])
  const selectedLines = cart.lines.filter((l) => cart.selected.includes(l.productId))
  const quote = useAsync(() => quoteCart(selectedLines), [JSON.stringify(selectedLines)])
  const suggestions = useAsync(() => getSuggestedAccessories(ids), [ids.join(',')])

  if (cart.lines.length === 0)
    return (
      <div className="container-page py-10">
        <EmptyState title="Giỏ hàng của bạn đang trống" description="Hãy khám phá các sản phẩm và thêm vào giỏ hàng nhé." action={<Link to="/" className="btn-primary">Tiếp tục mua sắm</Link>} />
      </div>
    )
  if (products.loading && !products.data) return <Spinner />

  const allSelected = cart.selected.length === cart.lines.length
  // Kiểm tra tồn kho trước khi sang bước thanh toán
  const stockProblem = selectedLines.find((l) => {
    const p = products.data?.find((x) => x.id === l.productId)
    return !p || !p.isActive || p.stock < l.quantity
  })

  return (
    <div className="container-page py-6">
      <Breadcrumb items={[{ label: 'Giỏ hàng' }]} />
      <h1 className="mt-3 text-2xl font-bold">Giỏ hàng của bạn <span className="text-base font-normal text-slate-500">({cart.count} sản phẩm)</span></h1>

      {freeShippingThreshold !== null && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          <Truck className="size-5 shrink-0" />
          Miễn phí vận chuyển cho đơn hàng từ <b>{formatVND(freeShippingThreshold)}</b>.
          <Link to="/khuyen-mai" className="ml-auto shrink-0 text-xs font-semibold underline">Điều kiện</Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="card flex items-center justify-between px-4 py-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="size-4 accent-brand-700" checked={allSelected} onChange={() => cart.setAllSelected(!allSelected)} />
              Chọn tất cả ({cart.lines.length} sản phẩm)
            </label>
            <button
              className="text-sm text-red-600 hover:underline"
              onClick={() => {
                if (confirm('Xóa toàn bộ sản phẩm trong giỏ hàng?')) cart.clear()
              }}
            >
              Xóa tất cả
            </button>
          </div>

          {cart.lines.map((line) => {
            const p = products.data?.find((x) => x.id === line.productId)
            if (!p) return null
            const over = p.stock < line.quantity
            return (
              <div key={line.productId} className="card flex gap-3 p-4 sm:gap-4">
                <input type="checkbox" className="mt-8 size-4 shrink-0 accent-brand-700" checked={cart.selected.includes(p.id)} onChange={() => cart.toggleSelected(p.id)} aria-label="Chọn sản phẩm" />
                <Link to={`/san-pham/${p.slug}`} className="shrink-0">
                  <ProductImage src={p.images[0]} alt={p.name} className="size-20 rounded-lg object-cover sm:size-24" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">{p.code}</p>
                  <Link to={`/san-pham/${p.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-brand-700">{p.name}</Link>
                  <div className="mt-1"><StockBadge stock={p.stock} /></div>
                  {over && <p className="mt-1 text-xs text-red-600">Số lượng vượt tồn kho (còn {p.stock}). Vui lòng giảm số lượng.</p>}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <QuantityInput value={line.quantity} max={Math.max(1, Math.min(p.stock, CART_MAX_QTY))} onChange={(v) => cart.setQuantity(p.id, v)} />
                    <div className="text-right">
                      <PriceTag product={p} />
                      <p className="text-xs text-slate-500">Thành tiền: <b className="text-ink">{formatVND(priceOf(p) * line.quantity)}</b></p>
                    </div>
                  </div>
                </div>
                <button
                  className="self-start text-slate-400 hover:text-red-600"
                  onClick={() => {
                    cart.remove(p.id)
                    toast.info('Đã xóa sản phẩm khỏi giỏ hàng')
                  }}
                  aria-label="Xóa sản phẩm"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            )
          })}

          {/* Gợi ý mua kèm (Combo — LAB 1) */}
          {!!suggestions.data?.length && (
            <div className="card p-4">
              <h3 className="flex items-center gap-2 font-semibold"><Gift className="size-5 text-brand-700" /> Gợi ý phụ kiện mua kèm</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {suggestions.data.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2">
                    <ProductImage src={s.images[0]} alt={s.name} className="size-14 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/san-pham/${s.slug}`} className="line-clamp-2 text-xs font-medium hover:text-brand-700">{s.name}</Link>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm font-bold text-red-600">{formatVND(priceOf(s))}</span>
                        <button className="text-xs font-semibold text-brand-700 hover:underline" onClick={() => { cart.add(s.id); toast.success('Đã thêm vào giỏ hàng') }}>+ Thêm</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
            <ArrowLeft className="size-4" /> Tiếp tục mua sắm
          </Link>
        </div>

        <div className="lg:sticky lg:top-40 lg:self-start">
          <OrderSummary quote={quote.data}>
            <button
              className="btn-primary mt-5 w-full py-3.5 text-base"
              disabled={selectedLines.length === 0 || !!stockProblem}
              onClick={() => {
                cart.setBuyNow(null)
                navigate('/thanh-toan')
              }}
            >
              Tiến hành đặt hàng <ArrowRight className="size-4" />
            </button>
            {selectedLines.length === 0 && <p className="mt-2 text-center text-xs text-red-600">Vui lòng chọn ít nhất 1 sản phẩm</p>}
            {stockProblem && <p className="mt-2 text-center text-xs text-red-600">Có sản phẩm vượt quá tồn kho</p>}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500"><Lock className="size-3.5" /> Giá và tổng tiền được hệ thống kiểm tra lại khi đặt hàng</p>
          </OrderSummary>
        </div>
      </div>
    </div>
  )
}
