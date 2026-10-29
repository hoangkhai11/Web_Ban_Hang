import { CheckCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState, Spinner } from '../../components/common/States'
import { useAsync } from '../../hooks/useAsync'
import { formatDateTime, formatVND } from '../../lib/format'
import { getMyOrder } from '../../services/orderService'

export default function OrderSuccessPage() {
  const { code = '' } = useParams()
  const { data, loading, error } = useAsync(() => getMyOrder(code), [code])

  if (loading) return <Spinner />
  if (error || !data) return <div className="container-page py-10"><ErrorState message={error ?? ''} /></div>

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-xl text-center">
        <CheckCircle2 className="mx-auto size-16 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-bold">Đặt hàng thành công!</h1>
        <p className="mt-2 text-slate-600">Cảm ơn bạn đã mua sắm tại GICUNGCO. Cửa hàng sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.</p>

        <div className="card mt-6 p-5 text-left text-sm">
          <div className="flex justify-between py-1.5"><span className="text-slate-500">Mã đơn hàng</span><b className="text-brand-700">{data.code}</b></div>
          <div className="flex justify-between py-1.5"><span className="text-slate-500">Thời gian đặt</span><span>{formatDateTime(data.createdAt)}</span></div>
          <div className="flex justify-between py-1.5"><span className="text-slate-500">Người nhận</span><span>{data.shipping.fullName} — {data.shipping.phone}</span></div>
          <div className="flex justify-between gap-4 py-1.5"><span className="shrink-0 text-slate-500">Địa chỉ</span><span className="text-right">{data.shipping.address}, {data.shipping.district}, {data.shipping.province}</span></div>
          <div className="flex justify-between py-1.5"><span className="text-slate-500">Thanh toán</span><span>COD — Chưa thanh toán</span></div>
          <div className="mt-2 flex justify-between border-t border-slate-200 pt-3"><span className="font-semibold">Tổng thanh toán</span><b className="text-lg text-red-600">{formatVND(data.total)}</b></div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={`/tai-khoan/don-hang/${data.code}`} className="btn-primary">Theo dõi đơn hàng</Link>
          <Link to="/" className="btn-outline">Tiếp tục mua sắm</Link>
        </div>
      </div>
    </div>
  )
}
