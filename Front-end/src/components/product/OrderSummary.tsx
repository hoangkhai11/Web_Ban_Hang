import { Truck } from 'lucide-react'
import type { ReactNode } from 'react'
import { formatVND } from '../../lib/format'
import type { PriceQuote } from '../../types'

/** Khối tóm tắt chi phí dùng chung cho Giỏ hàng và Thanh toán. */
export function OrderSummary({ quote, children, title = 'Tóm tắt chi phí' }: { quote: PriceQuote | null; children?: ReactNode; title?: string }) {
  const row = 'flex justify-between text-sm'
  return (
    <div className="card p-5">
      <h3 className="text-lg font-bold">{title}</h3>
      {!quote ? (
        <p className="mt-4 text-sm text-slate-500">Đang tính...</p>
      ) : (
        <>
          <div className="mt-4 space-y-2.5">
            <div className={row}>
              <span className="text-slate-600">Tạm tính ({quote.lines.reduce((s, l) => s + l.quantity, 0)} sản phẩm)</span>
              <span>{formatVND(quote.subtotal)}</span>
            </div>
            <div className={row}>
              <span className="text-slate-600">Giảm giá sản phẩm</span>
              <span className="text-emerald-700">{quote.discountTotal > 0 ? '-' + formatVND(quote.discountTotal) : formatVND(0)}</span>
            </div>
            <div className={row}>
              <span className="text-slate-600">Phí vận chuyển</span>
              <span>{quote.freeShipping ? <span className="font-semibold text-emerald-700">Miễn phí</span> : formatVND(quote.shippingFee)}</span>
            </div>
          </div>
          {quote.freeShippingThreshold !== null && quote.lines.length > 0 && (
            <div className="mt-4 rounded-lg bg-brand-50 p-3 text-xs text-brand-900">
              <p className="flex items-center gap-1.5 font-medium">
                <Truck className="size-4" />
                {quote.freeShipping ? 'Đơn hàng đã được miễn phí vận chuyển' : `Mua thêm ${formatVND(quote.amountToFreeShipping)} để được miễn phí vận chuyển`}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${Math.min(100, (quote.merchandiseTotal / quote.freeShippingThreshold) * 100)}%` }} />
              </div>
            </div>
          )}
          <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-4">
            <span className="font-semibold">Tổng thanh toán</span>
            <span className="text-2xl font-bold text-red-600">{formatVND(quote.total)}</span>
          </div>
          <p className="mt-1 text-right text-xs text-slate-400">Đã bao gồm VAT (nếu có)</p>
        </>
      )}
      {children}
    </div>
  )
}
