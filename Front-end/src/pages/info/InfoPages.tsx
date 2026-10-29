import { BadgePercent, CalendarDays, Clock, FileText, Mail, MapPin, Phone, RefreshCcw, ShieldCheck, Truck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumb } from '../../components/common/Misc'
import { ErrorState, Spinner } from '../../components/common/States'
import { ProductGrid } from '../../components/product/ProductCard'
import { usePricing } from '../../context/PricingContext'
import { useAsync } from '../../hooks/useAsync'
import { formatDate, formatVND } from '../../lib/format'
import { getPromotions } from '../../services/promotionService'
import NotFoundPage from './NotFoundPage'

function Page({ title, crumbs, children }: { title: string; crumbs?: { label: string; to?: string }[]; children: ReactNode }) {
  return (
    <div className="container-page py-6">
      <Breadcrumb items={crumbs ?? [{ label: title }]} />
      <h1 className="mt-3 text-2xl font-bold md:text-3xl">{title}</h1>
      <div className="mt-6">{children}</div>
    </div>
  )
}

export function PromotionsPage() {
  const { data, loading, error, reload } = useAsync(getPromotions, [])
  return (
    <Page title="Chương trình khuyến mãi">
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="space-y-10">
          {data!.map((p) => (
            <section key={p.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 bg-gradient-to-r from-brand-700 to-brand-600 p-6 text-white">
                <span className="flex size-16 items-center justify-center rounded-full bg-white/15 text-2xl font-extrabold">
                  {p.type === 'PRODUCT_PERCENT' ? `-${p.value}%` : <Truck className="size-8" />}
                </span>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{p.name}</h2>
                  <p className="text-sm text-brand-50">{p.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.running ? 'bg-white text-brand-800' : 'bg-slate-800/40'}`}>{p.running ? 'Đang áp dụng' : 'Không hoạt động'}</span>
              </div>
              <div className="grid gap-6 p-6 md:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-2 font-semibold"><CalendarDays className="size-4 text-brand-700" /> Thời gian áp dụng</h3>
                  <p className="mt-1 text-sm text-slate-600">Từ {formatDate(p.startDate)} đến hết {formatDate(p.endDate)}</p>
                  {p.type === 'FREE_SHIPPING' && (
                    <>
                      <h3 className="mt-4 flex items-center gap-2 font-semibold"><BadgePercent className="size-4 text-brand-700" /> Giá trị đơn tối thiểu</h3>
                      <p className="mt-1 text-sm text-slate-600">{formatVND(p.minOrderValue)} (tính trên tổng tiền hàng sau giảm giá)</p>
                    </>
                  )}
                </div>
                <div>
                  <h3 className="flex items-center gap-2 font-semibold"><FileText className="size-4 text-brand-700" /> Điều kiện</h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {p.conditions.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              </div>
              {p.type === 'PRODUCT_PERCENT' && p.products.length > 0 && (
                <div className="border-t border-slate-100 p-6">
                  <h3 className="mb-4 font-semibold">Sản phẩm áp dụng ({p.products.length})</h3>
                  <ProductGrid products={p.products} />
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </Page>
  )
}

export function SupportPage() {
  const cards = [
    { icon: Truck, title: 'Chính sách giao hàng', desc: 'Phí vận chuyển, thời gian giao, miễn phí vận chuyển.', to: '/chinh-sach/giao-hang' },
    { icon: ShieldCheck, title: 'Chính sách bảo hành', desc: 'Thời hạn và quy trình bảo hành sản phẩm.', to: '/chinh-sach/bao-hanh' },
    { icon: RefreshCcw, title: 'Chính sách đổi trả', desc: 'Điều kiện đổi trả trong 7 ngày.', to: '/chinh-sach/doi-tra' },
    { icon: Phone, title: 'Liên hệ', desc: 'Hotline, email và địa chỉ showroom.', to: '/lien-he' },
  ]
  return (
    <Page title="Hỗ trợ khách hàng">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, title, desc, to }) => (
          <Link key={to} to={to} className="card p-5 transition hover:border-brand-700 hover:shadow">
            <Icon className="size-8 text-brand-700" />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>
      <section className="card mt-8 p-6">
        <h2 className="text-lg font-bold">Hướng dẫn mua hàng</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Tìm sản phẩm bằng ô tìm kiếm (tên hoặc mã sản phẩm) hoặc chọn danh mục trên menu.</li>
          <li>Dùng bộ lọc giá, thương hiệu, cấu hình để thu hẹp kết quả; mở trang chi tiết để xem thông số, tồn kho, bảo hành.</li>
          <li>Nhấn <b>Thêm vào giỏ hàng</b> hoặc <b>Mua ngay</b>.</li>
          <li>Trong giỏ hàng, kiểm tra số lượng, giảm giá, phí vận chuyển và tổng tiền.</li>
          <li>Đăng nhập, nhập thông tin nhận hàng và xác nhận đặt hàng (thanh toán khi nhận hàng — COD).</li>
          <li>Theo dõi trạng thái tại <Link to="/tai-khoan/don-hang" className="text-brand-700 underline">Đơn hàng của tôi</Link>. Đơn còn “Chờ xác nhận” có thể tự hủy.</li>
        </ol>
      </section>
    </Page>
  )
}

export function PolicyPage() {
  const { type } = useParams()
  const { settings, freeShippingThreshold } = usePricing()

  const policies: Record<string, { title: string; body: ReactNode }> = {
    'giao-hang': {
      title: 'Chính sách giao hàng',
      body: (
        <>
          <h2>Phạm vi và phí giao hàng</h2>
          <ul>
            <li>Giao hàng toàn quốc. Phí vận chuyển cố định: <b>{formatVND(settings.baseShippingFee)}</b>/đơn.</li>
            <li>{freeShippingThreshold !== null ? <>Miễn phí vận chuyển cho đơn hàng có tổng tiền hàng (sau giảm giá) từ <b>{formatVND(freeShippingThreshold)}</b>.</> : 'Hiện không có chương trình miễn phí vận chuyển.'}</li>
            <li>Phí vận chuyển được tính theo biểu phí của cửa hàng; hệ thống chưa tích hợp đơn vị vận chuyển bên thứ ba.</li>
          </ul>
          <h2>Thời gian giao hàng (dự kiến)</h2>
          <ul>
            <li>Nội thành Hà Nội: 1–2 ngày làm việc.</li>
            <li>Các tỉnh/thành khác: 3–5 ngày làm việc.</li>
          </ul>
          <h2>Thanh toán</h2>
          <p>Khách hàng thanh toán khi nhận hàng (COD) và được kiểm tra ngoại quan sản phẩm trước khi thanh toán.</p>
        </>
      ),
    },
    'bao-hanh': {
      title: 'Chính sách bảo hành',
      body: (
        <>
          <h2>Thời hạn bảo hành</h2>
          <p>Thời hạn bảo hành được ghi rõ trên trang chi tiết của từng sản phẩm (thường từ 12 đến 60 tháng tùy hãng).</p>
          <h2>Điều kiện bảo hành</h2>
          <ul>
            <li>Sản phẩm còn trong thời hạn bảo hành, tem bảo hành còn nguyên vẹn.</li>
            <li>Lỗi kỹ thuật do nhà sản xuất.</li>
            <li>Không áp dụng cho hư hỏng do rơi vỡ, vào nước, cháy nổ hoặc tự ý sửa chữa.</li>
          </ul>
          <h2>Quy trình</h2>
          <p>Mang sản phẩm đến showroom hoặc liên hệ hotline 1900 6868 để được hướng dẫn gửi bảo hành.</p>
        </>
      ),
    },
    'doi-tra': {
      title: 'Chính sách đổi trả',
      body: (
        <>
          <h2>Đổi mới trong 7 ngày</h2>
          <p>Trong 7 ngày kể từ khi nhận hàng, sản phẩm lỗi do nhà sản xuất được đổi sản phẩm mới cùng loại.</p>
          <h2>Điều kiện đổi trả</h2>
          <ul>
            <li>Sản phẩm còn đầy đủ hộp, phụ kiện, quà tặng kèm (nếu có).</li>
            <li>Không trầy xước, móp méo do người sử dụng.</li>
            <li>Có thông tin đơn hàng (mã đơn) tại GICUNGCO.</li>
          </ul>
          <h2>Hủy đơn hàng</h2>
          <p>Khách hàng có thể tự hủy đơn khi đơn đang ở trạng thái “Chờ xác nhận”. Sau khi đơn đã được xác nhận, vui lòng liên hệ hotline.</p>
        </>
      ),
    },
  }

  const policy = type ? policies[type] : undefined
  if (!policy) return <NotFoundPage />
  return (
    <Page title={policy.title} crumbs={[{ label: 'Hỗ trợ khách hàng', to: '/ho-tro' }, { label: policy.title }]}>
      <article className="prose-policy card max-w-3xl p-6 text-sm leading-relaxed text-slate-700 [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-ink [&_h2:first-child]:mt-0 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {policy.body}
      </article>
    </Page>
  )
}

export function AboutPage() {
  return (
    <Page title="Giới thiệu GICUNGCO">
      <div className="card max-w-3xl space-y-3 p-6 text-sm leading-relaxed text-slate-700">
        <p><b>GICUNGCO</b> là cửa hàng bán lẻ trực tuyến (mô hình B2C) chuyên máy tính, laptop, linh kiện và phụ kiện máy tính dành cho khách hàng cá nhân.</p>
        <p>Cửa hàng trực tiếp quản lý sản phẩm, giá bán, tồn kho; tiếp nhận, xác nhận và giao đơn hàng; đồng thời hỗ trợ bảo hành, đổi trả sau mua.</p>
        <p>Chúng tôi tập trung vào hai nhóm khách hàng: <b>sinh viên</b> cần laptop học tập phù hợp ngân sách và <b>người đi làm</b> cần nâng cấp linh kiện — với thông số rõ ràng, giá minh bạch và quy trình đặt hàng đơn giản.</p>
        <p className="text-xs text-slate-400">Đây là website thực hành môn Thương mại điện tử; dữ liệu sản phẩm và giá chỉ mang tính minh họa.</p>
      </div>
    </Page>
  )
}

export function ContactPage() {
  const items = [
    { icon: Phone, label: 'Hotline', value: '1900 6868', href: 'tel:19006868' },
    { icon: Mail, label: 'Email', value: 'hotro@gicungco.vn', href: 'mailto:hotro@gicungco.vn' },
    { icon: MapPin, label: 'Showroom', value: 'Số 68 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội' },
    { icon: Clock, label: 'Giờ làm việc', value: '8:00 – 21:00, tất cả các ngày trong tuần' },
  ]
  return (
    <Page title="Liên hệ" crumbs={[{ label: 'Hỗ trợ khách hàng', to: '/ho-tro' }, { label: 'Liên hệ' }]}>
      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        {items.map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="card flex items-start gap-3 p-5">
            <Icon className="size-6 shrink-0 text-brand-700" />
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              {href ? <a href={href} className="font-semibold text-brand-700 hover:underline">{value}</a> : <p className="font-semibold">{value}</p>}
            </div>
          </div>
        ))}
      </div>
    </Page>
  )
}
