import { BadgeCheck, Headset, RefreshCcw, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatVND } from '../../lib/format'
import { usePricing } from '../../context/PricingContext'
import { Logo } from './Header'

/** Dải cam kết — chỉ nêu chính sách đã công bố trong các trang chính sách của cửa hàng. */
export function CommitmentBar() {
  const { freeShippingThreshold } = usePricing()
  const items = [
    { icon: BadgeCheck, title: 'Hàng chính hãng', desc: 'Có hóa đơn, tem bảo hành hãng', to: '/chinh-sach/bao-hanh' },
    { icon: Truck, title: 'Giao hàng toàn quốc', desc: freeShippingThreshold ? `Miễn phí đơn từ ${formatVND(freeShippingThreshold)}` : 'Phí cố định, thông báo trước', to: '/chinh-sach/giao-hang' },
    { icon: RefreshCcw, title: 'Đổi trả 7 ngày', desc: 'Khi lỗi do nhà sản xuất', to: '/chinh-sach/doi-tra' },
    { icon: Headset, title: 'Hỗ trợ kỹ thuật', desc: 'Hotline 1900 6868', to: '/lien-he' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(({ icon: Icon, title, desc, to }) => (
        <Link key={title} to={to} className="flex items-center gap-3 rounded-xl bg-surface p-4 transition hover:bg-brand-50">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-700">
            <Icon className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">{title}</span>
            <span className="block text-xs text-slate-500">{desc}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-500">Cửa hàng máy tính, laptop, linh kiện và phụ kiện chính hãng dành cho học tập, làm việc và giải trí.</p>
          <ul className="mt-4 space-y-1 text-sm text-slate-600">
            <li>Hotline: <b>1900 6868</b></li>
            <li>Email: hotro@gicungco.vn</li>
            <li>Showroom: Số 68 Cầu Giấy, Quận Cầu Giấy, Hà Nội</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Hỗ trợ khách hàng</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link to="/tai-khoan/don-hang" className="hover:text-brand-700">Tra cứu đơn hàng</Link></li>
            <li><Link to="/ho-tro" className="hover:text-brand-700">Hướng dẫn mua hàng</Link></li>
            <li><Link to="/khuyen-mai" className="hover:text-brand-700">Chương trình khuyến mãi</Link></li>
            <li><Link to="/lien-he" className="hover:text-brand-700">Liên hệ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Chính sách</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link to="/chinh-sach/giao-hang" className="hover:text-brand-700">Chính sách giao hàng</Link></li>
            <li><Link to="/chinh-sach/bao-hanh" className="hover:text-brand-700">Chính sách bảo hành</Link></li>
            <li><Link to="/chinh-sach/doi-tra" className="hover:text-brand-700">Chính sách đổi trả</Link></li>
            <li><Link to="/gioi-thieu" className="hover:text-brand-700">Giới thiệu GICUNGCO</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Phương thức thanh toán</h4>
          <p className="mt-3 text-sm text-slate-600">Thanh toán khi nhận hàng (COD)</p>
          <div className="mt-2 inline-flex rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-800">COD</div>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © 2026 GICUNGCO. Dự án thực hành Thương mại điện tử — dữ liệu sản phẩm và giá chỉ mang tính minh họa.
      </div>
    </footer>
  )
}
