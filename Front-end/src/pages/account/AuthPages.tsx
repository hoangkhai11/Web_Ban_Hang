import { Loader2 } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Logo } from '../../components/layout/Header'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { classNames } from '../../lib/format'
import { forgotPassword } from '../../services/authService'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, error, ...props }: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label" htmlFor={props.id}>{label}</label>
      <input {...props} className={classNames('input', error && 'input-error')} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function LoginPage({ admin = false }: { admin?: boolean }) {
  const { login, user } = useAuth()
  const location = useLocation()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const from = (location.state as { from?: string } | null)?.from ?? (admin ? '/admin' : '/')

  if (user && (!admin || user.role === 'ADMIN')) return <Navigate to={from} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!EMAIL_RE.test(email)) errs.email = 'Email không hợp lệ'
    if (!password) errs.password = 'Vui lòng nhập mật khẩu'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    setServerError('')
    try {
      const u = await login(email, password, admin)
      toast.success(`Xin chào, ${u.fullName}!`)
      // Khi user được cập nhật, component tự chuyển về `from` (xem Navigate ở trên)
    } catch (err) {
      setServerError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const content = (
    <form onSubmit={submit} noValidate className="space-y-4">
      {serverError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
      <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
      <Field id="password" label="Mật khẩu" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
      {!admin && (
        <div className="text-right">
          <Link to="/quen-mat-khau" className="text-sm text-brand-700 hover:underline">Quên mật khẩu?</Link>
        </div>
      )}
      <button className="btn-primary w-full py-3" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />} Đăng nhập
      </button>
      <div className="rounded-lg bg-surface p-3 text-xs text-slate-600">
        <b>Tài khoản demo:</b>
        <br />
        {admin ? 'admin@gicungco.vn / Admin@123' : 'khachhang@gicungco.vn / Khach@123'}
      </div>
      {!admin && (
        <p className="text-center text-sm text-slate-600">
          Chưa có tài khoản? <Link to="/dang-ky" state={location.state} className="font-semibold text-brand-700 hover:underline">Đăng ký ngay</Link>
        </p>
      )}
    </form>
  )

  if (admin)
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 md:p-8">
          <Logo />
          <h1 className="mt-6 text-xl font-bold">Đăng nhập quản trị</h1>
          <p className="mb-6 text-sm text-slate-500">Khu vực dành riêng cho nhân viên cửa hàng.</p>
          {content}
          <Link to="/" className="mt-4 block text-center text-sm text-slate-500 hover:underline">← Về trang bán hàng</Link>
        </div>
      </div>
    )

  return <AuthCard title="Đăng nhập" subtitle="Đăng nhập để đặt hàng và theo dõi đơn hàng.">{content}</AuthCard>
}

export function RegisterPage() {
  const { register, user } = useAuth()
  const location = useLocation()
  const toast = useToast()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (user) return <Navigate to={from} replace />
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.fullName.trim().length < 2) errs.fullName = 'Vui lòng nhập họ tên'
    if (!EMAIL_RE.test(form.email)) errs.email = 'Email không hợp lệ'
    if (!/^0\d{9}$/.test(form.phone)) errs.phone = 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0'
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) errs.password = 'Mật khẩu tối thiểu 8 ký tự, gồm chữ và số'
    if (form.confirm !== form.password) errs.confirm = 'Mật khẩu nhập lại không khớp'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    setServerError('')
    try {
      await register({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password })
      toast.success('Đăng ký tài khoản thành công!')
    } catch (err) {
      setServerError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Tạo tài khoản" subtitle="Đăng ký để mua hàng nhanh hơn và theo dõi đơn hàng.">
      <form onSubmit={submit} noValidate className="space-y-4">
        {serverError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>}
        <Field id="fullName" label="Họ và tên" value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
        <Field id="email" label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field id="phone" label="Số điện thoại" inputMode="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
        <Field id="password" label="Mật khẩu" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
        <Field id="confirm" label="Nhập lại mật khẩu" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />} Đăng ký
        </button>
        <p className="text-center text-sm text-slate-600">
          Đã có tài khoản? <Link to="/dang-nhap" className="font-semibold text-brand-700 hover:underline">Đăng nhập</Link>
        </p>
      </form>
    </AuthCard>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email)) return setError('Email không hợp lệ')
    setError('')
    setLoading(true)
    const r = await forgotPassword(email)
    setMessage(r.message)
    setLoading(false)
  }

  return (
    <AuthCard title="Quên mật khẩu" subtitle="Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.">
      {message ? (
        <div className="space-y-4">
          <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>
          <p className="text-xs text-slate-500">(Chế độ demo: hệ thống chưa gửi email thật.)</p>
          <Link to="/dang-nhap" className="btn-primary w-full">Quay lại đăng nhập</Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <button className="btn-primary w-full py-3" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />} Gửi hướng dẫn
          </button>
          <Link to="/dang-nhap" className="block text-center text-sm text-brand-700 hover:underline">Quay lại đăng nhập</Link>
        </form>
      )}
    </AuthCard>
  )
}
