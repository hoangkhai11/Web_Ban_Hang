// Kiểu dữ liệu dùng chung — khớp với các bảng MySQL dự kiến ở Back-end
// (categories, products, customers, orders, order_items, promotions).

export interface Category {
  id: number
  slug: string
  name: string
  parentId: number | null
  description: string
  icon: string // tên icon lucide dùng ở trang chủ
}

export interface CategoryNode extends Category {
  children: Category[]
}

/** Thuộc tính lọc đã chuẩn hóa (LAB 6). Chỉ những khóa phù hợp với loại sản phẩm mới có giá trị. */
export type AttributeKey =
  | 'cpu'
  | 'ram'
  | 'storage'
  | 'storageType'
  | 'gpu'
  | 'vram'
  | 'ramType'
  | 'socket'
  | 'connection'
  | 'screenSize'
  | 'resolution'

export interface Product {
  id: number
  code: string // mã sản phẩm, VD: LT-NB14-01
  slug: string
  name: string
  categoryId: number
  brand: string
  price: number // giá niêm yết (VNĐ)
  stock: number
  images: string[]
  highlights: string[] // thông số nổi bật hiển thị trên thẻ sản phẩm
  description: string
  specs: Record<string, string> // bảng thông số kỹ thuật đầy đủ
  attributes: Partial<Record<AttributeKey, string>>
  warrantyMonths: number
  soldCount: number
  createdAt: string
  isActive: boolean
  compatibilityNote?: string // lưu ý tương thích cho linh kiện (persona 2)
}

export type PromotionType = 'PRODUCT_PERCENT' | 'FREE_SHIPPING'

export interface Promotion {
  id: number
  name: string
  type: PromotionType
  value: number // % giảm (PRODUCT_PERCENT) — không dùng cho FREE_SHIPPING
  minOrderValue: number // ngưỡng đơn hàng (FREE_SHIPPING)
  startDate: string
  endDate: string
  isActive: boolean
  productIds: number[] // sản phẩm áp dụng (PRODUCT_PERCENT)
  description: string
  conditions: string[]
}

export interface ShopSettings {
  baseShippingFee: number
}

export type Role = 'CUSTOMER' | 'ADMIN'

export interface User {
  id: number
  fullName: string
  email: string
  phone: string
  address: string
  role: Role
  createdAt: string
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'COMPLETED'
  | 'CANCELLED'

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED'

export interface ShippingInfo {
  fullName: string
  phone: string
  province: string
  district: string
  address: string
  note: string
}

export interface OrderItem {
  productId: number
  productCode: string
  productName: string
  image: string
  unitPrice: number // đơn giá tại thời điểm mua (đã trừ khuyến mãi)
  originalPrice: number
  quantity: number
  lineTotal: number
}

export interface OrderHistory {
  status: OrderStatus
  at: string
  note: string
}

export interface Order {
  id: number
  code: string
  customerId: number
  createdAt: string
  items: OrderItem[]
  subtotal: number // tổng theo giá niêm yết
  discountTotal: number
  shippingFee: number
  total: number
  status: OrderStatus
  paymentMethod: 'COD'
  paymentStatus: PaymentStatus
  shipping: ShippingInfo
  history: OrderHistory[]
  stockReleased: boolean
}

export interface CartLine {
  productId: number
  quantity: number
}

export interface PriceQuoteLine {
  product: Product
  quantity: number
  originalPrice: number
  unitPrice: number
  lineTotal: number
  discountPercent: number
}

export interface PriceQuote {
  lines: PriceQuoteLine[]
  subtotal: number
  discountTotal: number
  merchandiseTotal: number
  shippingFee: number
  freeShipping: boolean
  freeShippingThreshold: number | null
  amountToFreeShipping: number
  total: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type SortKey = 'popular' | 'newest' | 'price-asc' | 'price-desc'

export interface ProductQuery {
  categorySlug?: string
  q?: string
  brands?: string[]
  priceRange?: string // under-5 | 5-15 | over-15
  attrs?: Partial<Record<AttributeKey, string[]>>
  inStock?: boolean
  promo?: boolean
  sort?: SortKey
  page?: number
  pageSize?: number
}
