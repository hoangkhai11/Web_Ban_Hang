import { AlertCircle, BadgeCheck, Banknote, RefreshCcw, ShieldCheck, ShoppingCart, Truck, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb, QuantityInput, SectionTitle, StockBadge } from '../../components/common/Misc'
import { ErrorState, Spinner } from '../../components/common/States'
import { PriceTag, ProductGrid, ProductImage } from '../../components/product/ProductCard'
import { CART_MAX_QTY, useCart } from '../../context/CartContext'
import { usePricing } from '../../context/PricingContext'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { classNames, formatVND } from '../../lib/format'
import { getProductBySlug, getRelatedProducts } from '../../services/catalogService'
import NotFoundPage from '../info/NotFoundPage'

export default function ProductDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const cart = useCart()
  const toast = useToast()
  const { discountOf, priceOf, settings, freeShippingThreshold } = usePricing()
  const { data, loading, error, reload } = useAsync(() => getProductBySlug(slug), [slug])
  const related = useAsync(() => (data ? getRelatedProducts(data.product) : Promise.resolve([])), [data?.product.id])
  const [imgIdx, setImgIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'desc' | 'specs'>('desc')

  useEffect(() => {
    setImgIdx(0)
    setQty(1)
  }, [slug])

  if (loading) return <Spinner />
  if (error?.includes('không tồn tại')) return <NotFoundPage message={error} />
  if (error || !data) return <div className="container-page py-10"><ErrorState message={error ?? ''} onRetry={reload} /></div>

  const { product, category, parent } = data
  const out = product.stock <= 0
  const maxQty = Math.min(product.stock, CART_MAX_QTY)
  const discount = discountOf(product)
  const inCart = cart.lines.find((l) => l.productId === product.id)?.quantity ?? 0

  const addToCart = () => {
    if (inCart + qty > product.stock) {
      toast.error(`Chỉ còn ${product.stock} sản phẩm, giỏ hàng đã có ${inCart}`)
      return
    }
    cart.add(product.id, qty)
    toast.success(`Đã thêm ${qty} sản phẩm vào giỏ hàng`)
  }
  const buyNow = () => {
    cart.setBuyNow({ productId: product.id, quantity: qty })
    navigate('/thanh-toan?mode=buy-now')
  }

  return (
    <div className="container-page py-6">
      <Breadcrumb
        items={[
          ...(parent ? [{ label: parent.name, to: `/danh-muc/${parent.slug}` }] : []),
          { label: category.name, to: `/danh-muc/${category.slug}` },
          { label: product.name },
        ]}
      />

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Hình ảnh */}
        <div>
          <div className="card relative overflow-hidden p-4">
            {discount > 0 && <span className="absolute top-4 left-4 z-10 rounded bg-red-600 px-2.5 py-1 text-sm font-bold text-white">-{discount}%</span>}
            <ProductImage src={product.images[imgIdx]} alt={product.name} className="aspect-[4/3] w-full rounded-lg object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((src, i) => (
                <button key={src + i} onClick={() => setImgIdx(i)} className={classNames('overflow-hidden rounded-lg border-2', i === imgIdx ? 'border-brand-700' : 'border-transparent opacity-70 hover:opacity-100')} aria-label={`Ảnh ${i + 1}`}>
                  <ProductImage src={src} alt="" className="size-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thông tin mua hàng */}
        <div>
          <p className="text-sm font-semibold text-brand-700 uppercase">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">{product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span>Mã SP: <b className="text-ink">{product.code}</b></span>
            <span>Bảo hành: <b className="text-ink">{product.warrantyMonths} tháng</b></span>
            <StockBadge stock={product.stock} />
          </div>

          <div className="mt-4 rounded-xl bg-surface p-4">
            <PriceTag product={product} size="lg" />
            {discount > 0 && (
              <p className="mt-1 text-sm text-emerald-700">
                Tiết kiệm {formatVND(product.price - priceOf(product))} — chương trình <Link to="/khuyen-mai" className="font-semibold underline">Giảm {discount}% sản phẩm chọn lọc</Link>
              </p>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold">Thông số chính</h3>
            <ul className="mt-2 grid grid-cols-2 gap-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <BadgeCheck className="size-4 shrink-0 text-brand-700" /> {h}
                </li>
              ))}
            </ul>
          </div>

          {product.compatibilityNote && (
            <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span><b>Lưu ý tương thích:</b> {product.compatibilityNote}</span>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Số lượng:</span>
            <QuantityInput value={qty} onChange={setQty} max={Math.max(1, maxQty)} />
            {!out && <span className="text-xs text-slate-500">Tối đa {maxQty} sản phẩm/lần</span>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="btn-outline border-brand-700 py-3 text-brand-700" disabled={out} onClick={addToCart}>
              <ShoppingCart className="size-4" /> Thêm vào giỏ hàng
            </button>
            <button className="btn-primary py-3" disabled={out} onClick={buyNow}>
              <Zap className="size-4" /> Mua ngay
            </button>
          </div>
          {out && <p className="mt-2 text-sm text-red-600">Sản phẩm tạm hết hàng. Vui lòng liên hệ 1900 6868 để được báo khi có hàng.</p>}

          {/* Giao hàng & chính sách */}
          <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
            <div className="flex gap-3 p-4">
              <Truck className="size-5 shrink-0 text-brand-700" />
              <div>
                <p className="font-semibold">Phí giao hàng</p>
                <p className="text-slate-600">
                  {formatVND(settings.baseShippingFee)}/đơn trên toàn quốc
                  {freeShippingThreshold !== null && <> — <b className="text-emerald-700">miễn phí</b> cho đơn từ {formatVND(freeShippingThreshold)}</>}.
                </p>
                <p className="text-xs text-slate-400">Theo biểu phí của cửa hàng, chưa tích hợp đơn vị vận chuyển. <Link to="/chinh-sach/giao-hang" className="underline">Chi tiết</Link></p>
              </div>
            </div>
            <div className="flex gap-3 p-4">
              <Banknote className="size-5 shrink-0 text-brand-700" />
              <div>
                <p className="font-semibold">Thanh toán khi nhận hàng (COD)</p>
                <p className="text-slate-600">Kiểm tra hàng trước khi thanh toán cho nhân viên giao hàng.</p>
              </div>
            </div>
            <div className="flex gap-3 p-4">
              <ShieldCheck className="size-5 shrink-0 text-brand-700" />
              <div>
                <p className="font-semibold">Bảo hành {product.warrantyMonths} tháng</p>
                <p className="text-slate-600">Bảo hành chính hãng. <Link to="/chinh-sach/bao-hanh" className="text-brand-700 underline">Chính sách bảo hành</Link></p>
              </div>
            </div>
            <div className="flex gap-3 p-4">
              <RefreshCcw className="size-5 shrink-0 text-brand-700" />
              <div>
                <p className="font-semibold">Đổi trả trong 7 ngày</p>
                <p className="text-slate-600">Đổi mới nếu lỗi do nhà sản xuất. <Link to="/chinh-sach/doi-tra" className="text-brand-700 underline">Chính sách đổi trả</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mô tả + thông số */}
      <section className="mt-10">
        <div className="flex gap-6 border-b border-slate-200">
          {(['desc', 'specs'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={classNames('-mb-px border-b-2 pb-3 text-sm font-semibold', tab === t ? 'border-brand-700 text-brand-700' : 'border-transparent text-slate-500')}>
              {t === 'desc' ? 'Mô tả sản phẩm' : 'Thông số kỹ thuật'}
            </button>
          ))}
        </div>
        <div className="mt-5 max-w-3xl">
          {tab === 'desc' ? (
            <p className="leading-relaxed text-slate-700">{product.description}</p>
          ) : (
            <table className="w-full overflow-hidden rounded-lg text-sm">
              <tbody>
                {Object.entries(product.specs).map(([k, v], i) => (
                  <tr key={k} className={i % 2 === 0 ? 'bg-surface' : 'bg-white'}>
                    <th className="w-1/3 px-4 py-2.5 text-left font-medium text-slate-600">{k}</th>
                    <td className="px-4 py-2.5">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {!!related.data?.length && (
        <section className="mt-12">
          <SectionTitle title="Sản phẩm liên quan" />
          <ProductGrid products={related.data} />
        </section>
      )}
    </div>
  )
}
