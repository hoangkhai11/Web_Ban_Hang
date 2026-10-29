import { ArrowRight, BadgePercent, GraduationCap, Truck, Wrench } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoryIcon } from '../../components/common/CategoryIcon'
import { SectionTitle } from '../../components/common/Misc'
import { ErrorState, ProductGridSkeleton } from '../../components/common/States'
import { CommitmentBar } from '../../components/layout/Footer'
import { ProductGrid, ProductImage } from '../../components/product/ProductCard'
import { useAsync } from '../../hooks/useAsync'
import { classNames, formatDate, formatVND } from '../../lib/format'
import { getBestSellers, getCategoryTree } from '../../services/catalogService'
import { getPromotions } from '../../services/promotionService'

const TABS = [
  { label: 'Tất cả', slug: undefined },
  { label: 'Laptop', slug: 'laptop' },
  { label: 'Linh kiện', slug: 'linh-kien-may-tinh' },
  { label: 'Phụ kiện', slug: 'phu-kien-may-tinh' },
]

function Hero() {
  return (
    <section className="bg-gradient-to-br from-brand-50 via-white to-surface">
      <div className="container-page grid items-center gap-8 py-10 md:grid-cols-2 md:py-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
            <BadgePercent className="size-3.5" /> Giảm 5% cho sản phẩm chọn lọc
          </span>
          <h1 className="mt-4 text-3xl leading-tight font-extrabold md:text-5xl">
            Công nghệ phù hợp.
            <br />
            <span className="text-brand-700">Hiệu năng vượt trội.</span>
          </h1>
          <p className="mt-4 max-w-lg text-slate-600">
            Laptop cho sinh viên, linh kiện nâng cấp cho người đi làm — thông số rõ ràng, giá minh bạch, thanh toán khi nhận hàng.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/danh-muc/may-tinh-laptop" className="btn-primary px-6 py-3">
              Khám phá sản phẩm <ArrowRight className="size-4" />
            </Link>
            <Link to="/khuyen-mai" className="btn-outline px-6 py-3">
              Xem ưu đãi
            </Link>
          </div>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-2"><GraduationCap className="size-4 text-brand-700" /> Laptop học tập</span>
            <span className="flex items-center gap-2"><Wrench className="size-4 text-brand-700" /> Linh kiện nâng cấp</span>
            <span className="flex items-center gap-2"><Truck className="size-4 text-brand-700" /> Giao toàn quốc</span>
          </div>
        </div>
        <div className="relative">
          <ProductImage
            src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&q=80&auto=format&fit=crop"
            alt="PC gaming và laptop GICUNGCO"
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl"
          />
          <div className="absolute -bottom-4 left-4 rounded-xl bg-white px-4 py-3 shadow-lg">
            <p className="text-xs text-slate-500">Case máy tính</p>
            <p className="text-lg font-bold text-red-600">12.490.000đ</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [tab, setTab] = useState(0)
  const categories = useAsync(getCategoryTree, [])
  const best = useAsync(() => getBestSellers(8, TABS[tab].slug), [tab])
  const promos = useAsync(getPromotions, [])

  return (
    <>
      <Hero />

      {/* Danh mục nổi bật */}
      <section className="container-page mt-12">
        <SectionTitle eyebrow="Phân loại sản phẩm" title="Danh mục nổi bật" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11">
          {categories.data
            ?.flatMap((r) => r.children)
            .map((c) => (
              <Link key={c.id} to={`/danh-muc/${c.slug}`} className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 text-center transition hover:border-brand-700 hover:shadow">
                <span className="flex size-12 items-center justify-center rounded-full bg-surface text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                  <CategoryIcon name={c.icon} className="size-6" />
                </span>
                <span className="text-xs font-medium">{c.name}</span>
              </Link>
            ))}
        </div>
      </section>

      {/* Sản phẩm bán chạy */}
      <section className="container-page mt-12">
        <SectionTitle
          eyebrow="Top sản phẩm bán chạy"
          title="Sản phẩm bán chạy"
          action={
            <div className="flex flex-wrap gap-2">
              {TABS.map((t, i) => (
                <button key={t.label} onClick={() => setTab(i)} className={classNames('rounded-full px-4 py-1.5 text-sm font-medium transition', i === tab ? 'bg-brand-700 text-white' : 'bg-surface text-slate-600 hover:bg-brand-50')}>
                  {t.label}
                </button>
              ))}
            </div>
          }
        />
        {best.loading ? <ProductGridSkeleton /> : best.error ? <ErrorState message={best.error} onRetry={best.reload} /> : <ProductGrid products={best.data ?? []} />}
      </section>

      {/* Khuyến mãi nổi bật */}
      <section className="container-page mt-12">
        <SectionTitle eyebrow="Ưu đãi đang áp dụng" title="Khuyến mãi nổi bật" action={<Link to="/khuyen-mai" className="text-sm font-semibold text-brand-700 hover:underline">Xem chi tiết điều kiện →</Link>} />
        <div className="grid gap-4 md:grid-cols-2">
          {promos.data
            ?.filter((p) => p.running)
            .map((p) => (
              <Link key={p.id} to="/khuyen-mai" className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-600 p-6 text-white transition hover:shadow-lg">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl font-extrabold">
                  {p.type === 'PRODUCT_PERCENT' ? `-${p.value}%` : <Truck className="size-8" />}
                </span>
                <span>
                  <span className="block text-lg font-bold">{p.name}</span>
                  <span className="mt-1 block text-sm text-brand-50">
                    {p.type === 'FREE_SHIPPING' ? `Cho đơn hàng từ ${formatVND(p.minOrderValue)}` : `Áp dụng cho ${p.products.length} sản phẩm chọn lọc`}
                  </span>
                  <span className="mt-1 block text-xs text-brand-100">
                    {formatDate(p.startDate)} – {formatDate(p.endDate)}
                  </span>
                </span>
              </Link>
            ))}
        </div>
      </section>

      {/* Persona: gợi ý theo nhu cầu */}
      <section className="container-page mt-12">
        <SectionTitle eyebrow="Gợi ý theo nhu cầu" title="Bạn đang tìm gì?" />
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/danh-muc/laptop?price=5-15&sort=price-asc" className="card flex items-start gap-4 p-6 hover:border-brand-700">
            <GraduationCap className="size-10 shrink-0 text-brand-700" />
            <span>
              <span className="block font-semibold">Sinh viên cần laptop học tập</span>
              <span className="mt-1 block text-sm text-slate-500">Laptop 5–15 triệu, đủ cho học trực tuyến, làm bài tập và phần mềm văn phòng.</span>
              <span className="mt-2 inline-block text-sm font-semibold text-brand-700">Xem laptop phù hợp →</span>
            </span>
          </Link>
          <Link to="/danh-muc/linh-kien-may-tinh" className="card flex items-start gap-4 p-6 hover:border-brand-700">
            <Wrench className="size-10 shrink-0 text-brand-700" />
            <span>
              <span className="block font-semibold">Nâng cấp máy tính</span>
              <span className="mt-1 block text-sm text-slate-500">Tìm CPU, RAM, SSD, card đồ họa theo mã hoặc thông số, có lưu ý tương thích.</span>
              <span className="mt-2 inline-block text-sm font-semibold text-brand-700">Xem linh kiện →</span>
            </span>
          </Link>
        </div>
      </section>

      <section className="container-page mt-12">
        <CommitmentBar />
      </section>
    </>
  )
}
