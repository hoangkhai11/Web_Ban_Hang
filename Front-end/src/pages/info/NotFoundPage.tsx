import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage({ message }: { message?: string }) {
  return (
    <div className="container-page py-20">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <SearchX className="size-16 text-slate-400" />
        <p className="mt-4 text-5xl font-extrabold text-brand-700">404</p>
        <h1 className="mt-2 text-xl font-bold">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-slate-500">{message ?? 'Trang bạn tìm không tồn tại hoặc đã được di chuyển.'}</p>
        <div className="mt-6 flex gap-3">
          <Link to="/" className="btn-primary">Về trang chủ</Link>
          <Link to="/tim-kiem" className="btn-outline">Xem tất cả sản phẩm</Link>
        </div>
      </div>
    </div>
  )
}
