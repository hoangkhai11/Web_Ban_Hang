import { SlidersHorizontal, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Breadcrumb, Pagination, type Crumb } from '../../components/common/Misc'
import { EmptyState, ErrorState, ProductGridSkeleton } from '../../components/common/States'
import { ProductGrid } from '../../components/product/ProductCard'
import { useAsync } from '../../hooks/useAsync'
import { ATTRIBUTE_LABELS, CATEGORY_FILTERS, PRICE_RANGES, SORT_OPTIONS } from '../../lib/filters'
import { classNames } from '../../lib/format'
import { getCategoryBySlug, getProducts } from '../../services/catalogService'
import type { AttributeKey, SortKey } from '../../types'
import NotFoundPage from '../info/NotFoundPage'

const ALL_ATTRS = Object.keys(ATTRIBUTE_LABELS) as AttributeKey[]
const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : [])

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-4 last:border-0">
      <h4 className="mb-2 text-xs font-bold tracking-wide text-slate-700 uppercase">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Check({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: string; count?: number }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 hover:text-brand-700">
      <input type="checkbox" className="size-4 accent-brand-700" checked={checked} onChange={onChange} />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-slate-400">{count}</span>}
    </label>
  )
}

export default function ProductListPage({ mode }: { mode: 'category' | 'search' }) {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const [mobileFilter, setMobileFilter] = useState(false)

  const q = params.get('q') ?? ''
  const brands = list(params.get('brand'))
  const priceRange = params.get('price') ?? ''
  const sort = (params.get('sort') as SortKey) || 'popular'
  const page = Number(params.get('page') ?? 1)
  const inStock = params.get('stock') === '1'
  const attrs = Object.fromEntries(ALL_ATTRS.filter((k) => params.get(k)).map((k) => [k, list(params.get(k))])) as Partial<Record<AttributeKey, string[]>>

  const category = useAsync(() => (mode === 'category' && slug ? getCategoryBySlug(slug) : Promise.resolve(null)), [mode, slug])
  const result = useAsync(
    () => getProducts({ categorySlug: mode === 'category' ? slug : undefined, q, brands, priceRange, attrs, inStock, sort, page, pageSize: 8 }),
    [mode, slug, params.toString()],
  )

  const update = (changes: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    if (resetPage) next.delete('page')
    setParams(next)
  }
  const toggleIn = (key: string, value: string) => {
    const cur = list(params.get(key))
    update({ [key]: (cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]).join(',') })
  }

  if (mode === 'category' && category.error) return <NotFoundPage message={category.error} />

  const cat = category.data
  const filterKeys: AttributeKey[] = mode === 'category' && slug ? CATEGORY_FILTERS[slug] ?? [] : []
  const facets = result.data?.facets

  const title = mode === 'search' ? (q ? `Kết quả tìm kiếm cho "${q}"` : 'Tất cả sản phẩm') : cat?.category.name ?? ''
  const crumbs: Crumb[] =
    mode === 'search'
      ? [{ label: 'Tìm kiếm' }]
      : cat
        ? [...(cat.parent ? [{ label: cat.parent.name, to: `/danh-muc/${cat.parent.slug}` }] : []), { label: cat.category.name }]
        : []

  // Chip điều kiện lọc đang áp dụng
  const chips: { label: string; remove: () => void }[] = [
    ...brands.map((b) => ({ label: b, remove: () => toggleIn('brand', b) })),
    ...(priceRange ? [{ label: PRICE_RANGES.find((r) => r.value === priceRange)?.label ?? priceRange, remove: () => update({ price: null }) }] : []),
    ...Object.entries(attrs).flatMap(([k, vs]) => vs!.map((v) => ({ label: v, remove: () => toggleIn(k, v) }))),
    ...(inStock ? [{ label: 'Còn hàng', remove: () => update({ stock: null }) }] : []),
  ]
  const clearAll = () => setParams(q ? { q } : {})

  const filters = (
    <div>
      <div className="flex items-center justify-between pb-2">
        <h3 className="flex items-center gap-2 font-semibold"><SlidersHorizontal className="size-4" /> Bộ lọc</h3>
        {chips.length > 0 && <button className="text-xs font-semibold text-brand-700 hover:underline" onClick={clearAll}>Xóa tất cả</button>}
      </div>
      <FilterGroup title="Khoảng giá">
        {PRICE_RANGES.map((r) => (
          <label key={r.value} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 hover:text-brand-700">
            <input type="radio" name="price" className="size-4 accent-brand-700" checked={priceRange === r.value} onChange={() => update({ price: r.value })} />
            {r.label}
          </label>
        ))}
        {priceRange && <button className="text-xs text-slate-500 hover:underline" onClick={() => update({ price: null })}>Bỏ chọn</button>}
      </FilterGroup>
      {!!facets?.brands.length && (
        <FilterGroup title="Thương hiệu">
          {facets.brands.map((b) => (
            <Check key={b.value} label={b.value} count={b.count} checked={brands.includes(b.value)} onChange={() => toggleIn('brand', b.value)} />
          ))}
        </FilterGroup>
      )}
      {filterKeys.map((k) =>
        facets?.attributes[k]?.length ? (
          <FilterGroup key={k} title={ATTRIBUTE_LABELS[k]}>
            {facets.attributes[k]!.map((v) => (
              <Check key={v} label={v} checked={!!attrs[k]?.includes(v)} onChange={() => toggleIn(k, v)} />
            ))}
          </FilterGroup>
        ) : null,
      )}
      <FilterGroup title="Tình trạng hàng">
        <Check label="Chỉ hiện sản phẩm còn hàng" checked={inStock} onChange={() => update({ stock: inStock ? null : '1' })} />
      </FilterGroup>
    </div>
  )

  return (
    <div className="container-page py-6">
      <Breadcrumb items={crumbs} />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
          {cat?.category.description && <p className="mt-1 text-sm text-slate-500">{cat.category.description}</p>}
        </div>
        {result.data && <p className="text-sm text-slate-500"><b className="text-brand-700">{result.data.total}</b> sản phẩm</p>}
      </div>

      {/* Danh mục con */}
      {!!cat?.children.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {cat.children.map((c) => (
            <Link key={c.id} to={`/danh-muc/${c.slug}`} className="rounded-full border border-slate-300 px-4 py-1.5 text-sm hover:border-brand-700 hover:text-brand-700">
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">Đang lọc:</span>
          {chips.map((c) => (
            <button key={c.label} onClick={c.remove} className="inline-flex items-center gap-1 rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">
              {c.label} <X className="size-3" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button className="btn-outline py-1.5 lg:hidden" onClick={() => setMobileFilter(true)}>
              <SlidersHorizontal className="size-4" /> Bộ lọc {chips.length > 0 && `(${chips.length})`}
            </button>
            <span className="hidden text-sm text-slate-500 sm:inline">Sắp xếp theo:</span>
            {SORT_OPTIONS.map((o) => (
              <button key={o.value} onClick={() => update({ sort: o.value === 'popular' ? null : o.value })} className={classNames('rounded-full px-3 py-1.5 text-sm transition', sort === o.value ? 'bg-brand-700 font-semibold text-white' : 'bg-surface text-slate-600 hover:bg-brand-50')}>
                {o.label}
              </button>
            ))}
          </div>

          {result.loading ? (
            <ProductGridSkeleton />
          ) : result.error ? (
            <ErrorState message={result.error} onRetry={result.reload} />
          ) : result.data!.items.length === 0 ? (
            <EmptyState
              title="Không tìm thấy sản phẩm phù hợp"
              description={q ? `Không có sản phẩm khớp với "${q}". Hãy thử từ khóa khác, mã sản phẩm hoặc bỏ bớt điều kiện lọc.` : 'Hãy bỏ bớt điều kiện lọc để xem thêm sản phẩm.'}
              action={chips.length ? <button className="btn-primary" onClick={clearAll}>Xóa bộ lọc</button> : <Link to="/" className="btn-primary">Về trang chủ</Link>}
            />
          ) : (
            <>
              <ProductGrid products={result.data!.items} />
              <div className="mt-8">
                <Pagination page={result.data!.page} totalPages={result.data!.totalPages} onChange={(p) => update({ page: String(p) }, false)} />
              </div>
            </>
          )}
        </div>
      </div>

      {mobileFilter && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 lg:hidden" onClick={() => setMobileFilter(false)}>
          <aside className="ml-auto h-full w-80 max-w-[85%] overflow-y-auto bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex justify-end">
              <button onClick={() => setMobileFilter(false)} aria-label="Đóng bộ lọc"><X className="size-6" /></button>
            </div>
            {filters}
            <button className="btn-primary mt-4 w-full" onClick={() => setMobileFilter(false)}>Xem {result.data?.total ?? 0} sản phẩm</button>
          </aside>
        </div>
      )}
    </div>
  )
}
