import type { CartLine, PriceQuote, Product, Promotion, ShopSettings } from '../types'

/**
 * Quy tắc tính tiền — Back-end sẽ dùng CÙNG công thức này để xác thực lại khi tạo đơn.
 * 1. Giảm % chỉ áp dụng cho sản phẩm nằm trong danh sách của chương trình PRODUCT_PERCENT đang hiệu lực.
 * 2. Đơn giá sau giảm được làm tròn tới đơn vị đồng.
 * 3. Phí vận chuyển = phí cố định của cửa hàng; miễn phí nếu tổng tiền hàng (sau giảm) >= ngưỡng FREE_SHIPPING.
 */

export const isPromotionRunning = (p: Promotion, now = new Date()) => {
  if (!p.isActive) return false
  const start = new Date(p.startDate + 'T00:00:00')
  const end = new Date(p.endDate + 'T23:59:59')
  return now >= start && now <= end
}

export const getDiscountPercent = (product: Product, promotions: Promotion[]) => {
  const promo = promotions.find(
    (p) => p.type === 'PRODUCT_PERCENT' && isPromotionRunning(p) && p.productIds.includes(product.id),
  )
  return promo ? promo.value : 0
}

export const getUnitPrice = (product: Product, promotions: Promotion[]) => {
  const percent = getDiscountPercent(product, promotions)
  return Math.round((product.price * (100 - percent)) / 100)
}

export const getFreeShippingPromotion = (promotions: Promotion[]) =>
  promotions.find((p) => p.type === 'FREE_SHIPPING' && isPromotionRunning(p)) ?? null

export function quote(
  cart: CartLine[],
  products: Product[],
  promotions: Promotion[],
  settings: ShopSettings,
): PriceQuote {
  const lines = cart
    .map((line) => {
      const product = products.find((p) => p.id === line.productId)
      if (!product) return null
      const discountPercent = getDiscountPercent(product, promotions)
      const unitPrice = getUnitPrice(product, promotions)
      return {
        product,
        quantity: line.quantity,
        originalPrice: product.price,
        unitPrice,
        discountPercent,
        lineTotal: unitPrice * line.quantity,
      }
    })
    .filter((l): l is NonNullable<typeof l> => l !== null)

  const subtotal = lines.reduce((s, l) => s + l.originalPrice * l.quantity, 0)
  const merchandiseTotal = lines.reduce((s, l) => s + l.lineTotal, 0)
  const discountTotal = subtotal - merchandiseTotal

  const freeShip = getFreeShippingPromotion(promotions)
  const threshold = freeShip ? freeShip.minOrderValue : null
  const freeShipping = threshold !== null && merchandiseTotal >= threshold
  const shippingFee = lines.length === 0 || freeShipping ? 0 : settings.baseShippingFee

  return {
    lines,
    subtotal,
    discountTotal,
    merchandiseTotal,
    shippingFee,
    freeShipping,
    freeShippingThreshold: threshold,
    amountToFreeShipping: threshold === null ? 0 : Math.max(0, threshold - merchandiseTotal),
    total: merchandiseTotal + shippingFee,
  }
}
