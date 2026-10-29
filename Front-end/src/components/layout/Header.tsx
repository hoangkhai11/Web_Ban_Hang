import { ChevronDown, ClipboardList, LayoutGrid, LogOut, Menu, Phone, Search, ShieldCheck, ShoppingCart, User, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useAsync } from '../../hooks/useAsync'
import { classNames } from '../../lib/format'
import { getCategoryTree } from '../../services/catalogService'
import { CategoryIcon } from '../common/CategoryIcon'

// Menu chính LAB 8: tối đa 7 mục. Đăng nhập & giỏ hàng là biểu tượng riêng, không phải mục menu.
export const MAIN_MENU = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Máy tính', to: '/danh-muc/may-tinh-laptop' },
  { label: 'Linh kiện máy tính', to: '/danh-muc/linh-kien-may-tinh' },
  { label: 'Thiết bị lưu trữ & nguồn', to: '/danh-muc/o-cung' },
  { label: 'Phụ kiện máy tính', to: '/danh-muc/phu-kien-may-tinh' },
  { label: 'Khuyến mãi', to: '/khuyen-mai', hot: true },
  { label: 'Hỗ trợ khách hàng', to: '/ho-tro' },
]

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="GICUNGCO - Trang chủ">
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-700 text-lg font-extrabold text-white">G</span>
      <span className={classNames('text-xl font-extrabold tracking-tight', light ? 'text-white' : 'text-brand-700')}>GICUNGCO</span>
    </Link>
  )
}

function SearchBox({ className }: { className?: string }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const location = useLocation()
  const [q, setQ] = useState('')
  useEffect(() => {
    setQ(location.pathname === '/tim-kiem' ? params.get('q') ?? '' : '')
  }, [location.pathname, params])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate(`/tim-kiem?q=${encodeURIComponent(q.trim())}`)
  }
  return (
    <form onSubmit={submit} className={classNames('flex h-10 overflow-hidden rounded-lg border border-slate-300 focus-within:border-brand-700', className)} role="search">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm laptop, mã sản phẩm, linh kiện..." className="min-w-0 flex-1 px-3 text-sm outline-none" aria-label="Từ khóa tìm kiếm" />
      <button type="submit" className="flex w-12 items-center justify-center bg-brand-700 text-white hover:bg-brand-800" aria-label="Tìm kiếm">
        <Search className="size-4" />
      </button>
    </form>
  )
}

function AccountMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (!user)
    return (
      <Link to="/dang-nhap" className="flex items-center gap-2 text-sm hover:text-brand-700">
        <User className="size-5" />
        <span className="hidden leading-tight lg:block">
          <span className="block text-[11px] text-slate-500">Tài khoản</span>
          <span className="font-semibold">Đăng nhập</span>
        </span>
      </Link>
    )

  return (
    <div className="relative" ref={ref}>
      <button className="flex items-center gap-2 text-sm hover:text-brand-700" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800">{user.fullName.charAt(0)}</span>
        <span className="hidden max-w-28 truncate font-semibold lg:block">{user.fullName}</span>
        <ChevronDown className="hidden size-4 lg:block" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-lg">
          <Link to="/tai-khoan" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-surface" onClick={() => setOpen(false)}>
            <User className="size-4" /> Thông tin cá nhân
          </Link>
          <Link to="/tai-khoan/don-hang" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-surface" onClick={() => setOpen(false)}>
            <ClipboardList className="size-4" /> Đơn hàng của tôi
          </Link>
          {user.role === 'ADMIN' && (
            <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-surface" onClick={() => setOpen(false)}>
              <ShieldCheck className="size-4" /> Trang quản trị
            </Link>
          )}
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
            onClick={async () => {
              await logout()
              setOpen(false)
              navigate('/')
            }}
          >
            <LogOut className="size-4" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

function CategoryMegaMenu() {
  const { data } = useAsync(getCategoryTree, [])
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex h-10 items-center gap-2 rounded-lg bg-brand-700 px-4 text-xs font-bold tracking-wide text-white uppercase" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <LayoutGrid className="size-4" /> Danh mục sản phẩm <ChevronDown className="size-3.5" />
      </button>
      {open && data && (
        <div className="absolute left-0 z-40 pt-2">
          <div className="grid w-[640px] grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            {data.map((root) => (
              <div key={root.id}>
                <Link to={`/danh-muc/${root.slug}`} className="flex items-center gap-2 font-semibold text-brand-700 hover:underline">
                  <CategoryIcon name={root.icon} className="size-4" />
                  {root.name}
                </Link>
                <ul className="mt-2 space-y-1 text-sm">
                  {root.children.map((c) => (
                    <li key={c.id}>
                      <Link to={`/danh-muc/${c.slug}`} className="block rounded px-2 py-1 text-slate-600 hover:bg-surface hover:text-brand-700">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useAsync(getCategoryTree, [])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 lg:hidden" onClick={onClose}>
      <aside className="h-full w-80 max-w-[85%] overflow-y-auto bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <Logo />
          <button onClick={onClose} aria-label="Đóng menu">
            <X className="size-6" />
          </button>
        </div>
        <nav className="space-y-1">
          {MAIN_MENU.map((m) => (
            <NavLink key={m.to} to={m.to} end onClick={onClose} className={({ isActive }) => classNames('block rounded-lg px-3 py-2 text-sm font-medium', isActive ? 'bg-brand-50 text-brand-700' : 'hover:bg-surface')}>
              {m.label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase">Danh mục sản phẩm</p>
        {data?.map((root) => (
          <div key={root.id} className="mb-3">
            <Link to={`/danh-muc/${root.slug}`} onClick={onClose} className="block px-3 py-1 text-sm font-semibold text-brand-700">
              {root.name}
            </Link>
            {root.children.map((c) => (
              <Link key={c.id} to={`/danh-muc/${c.slug}`} onClick={onClose} className="block px-6 py-1 text-sm text-slate-600">
                {c.name}
              </Link>
            ))}
          </div>
        ))}
      </aside>
    </div>
  )
}

export function Header() {
  const { count } = useCart()
  const [drawer, setDrawer] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      {/* Top bar */}
      <div className="hidden bg-surface text-xs text-slate-600 md:block">
        <div className="container-page flex h-8 items-center justify-between">
          <span>Hotline hỗ trợ: <b className="text-brand-700">1900 6868</b> (8:00 - 21:00)</span>
          <div className="flex gap-4">
            <Link to="/chinh-sach/giao-hang" className="hover:text-brand-700">Chính sách giao hàng</Link>
            <Link to="/chinh-sach/bao-hanh" className="hover:text-brand-700">Bảo hành</Link>
            <Link to="/chinh-sach/doi-tra" className="hover:text-brand-700">Đổi trả</Link>
            <Link to="/lien-he" className="hover:text-brand-700">Liên hệ</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-page flex h-16 items-center gap-3 md:gap-6">
        <button className="lg:hidden" onClick={() => setDrawer(true)} aria-label="Mở menu">
          <Menu className="size-6" />
        </button>
        <Logo />
        <SearchBox className="hidden flex-1 md:flex" />
        <div className="ml-auto flex items-center gap-4 md:ml-0 md:gap-6">
          <a href="tel:19006868" className="hidden items-center gap-2 text-sm xl:flex">
            <Phone className="size-5 text-brand-700" />
            <span className="leading-tight">
              <span className="block text-[11px] text-slate-500">Tư vấn mua hàng</span>
              <span className="font-semibold">1900 6868</span>
            </span>
          </a>
          <Link to="/tai-khoan/don-hang" className="hidden items-center gap-2 text-sm hover:text-brand-700 lg:flex">
            <ClipboardList className="size-5" />
            <span className="leading-tight">
              <span className="block text-[11px] text-slate-500">Tra cứu</span>
              <span className="font-semibold">Đơn hàng</span>
            </span>
          </Link>
          <Link to="/gio-hang" className="relative flex items-center gap-2 text-sm hover:text-brand-700" aria-label={`Giỏ hàng (${count})`}>
            <span className="relative">
              <ShoppingCart className="size-6" />
              {count > 0 && <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">{count > 99 ? '99+' : count}</span>}
            </span>
            <span className="hidden font-semibold lg:block">Giỏ hàng</span>
          </Link>
          <AccountMenu />
        </div>
      </div>
      <div className="container-page pb-3 md:hidden">
        <SearchBox />
      </div>

      {/* Navigation */}
      <div className="hidden border-t border-slate-100 lg:block">
        <div className="container-page flex h-12 items-center gap-5">
          <CategoryMegaMenu />
          <nav className="flex items-center gap-5 text-sm">
            {MAIN_MENU.map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                end
                className={({ isActive }) => classNames('flex items-center gap-1 font-medium whitespace-nowrap transition hover:text-brand-700', isActive ? 'text-brand-700' : m.hot ? 'text-red-600' : 'text-slate-700')}
              >
                {m.label}
                {m.hot && <span className="rounded bg-red-600 px-1.5 text-[10px] font-bold text-white">HOT</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
    </header>
  )
}
