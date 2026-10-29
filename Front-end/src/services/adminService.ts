import type { Category, Order, OrderStatus, PaymentStatus, Product, Promotion, ShopSettings, User } from '../types'
import { api } from './api'

/** Mọi API Admin đều yêu cầu JWT có vai trò ADMIN (RolesGuard ở NestJS kiểm tra), không chỉ ẩn nút ở giao diện. */

// ================= Dashboard / thống kê =================

export interface DashboardData {
  revenue: number
  totalOrders: number
  pendingOrders: number
  statusCounts: { status: OrderStatus; count: number }[]
  customers: number
  products: number
  lowStock: Product[]
  recentOrders: Order[]
  revenueLast7Days: { date: string; revenue: number }[]
}

/** GET /api/admin/dashboard — doanh thu chỉ tính đơn COMPLETED */
export function getDashboard() {
  return api.get<DashboardData>('/admin/dashboard')
}

// ================= Sản phẩm =================

export type ProductInput = Omit<Product, 'id' | 'slug' | 'soldCount' | 'createdAt' | 'isActive'>

/** GET /api/admin/products */
export function listProducts() {
  return api.get<Product[]>('/admin/products')
}

/** GET /api/admin/products/:id */
export function getProduct(id: number) {
  return api.get<Product>(`/admin/products/${id}`)
}

/** POST /api/admin/products */
export function createProduct(input: ProductInput) {
  return api.post<Product>('/admin/products', input)
}

/** PUT /api/admin/products/:id */
export function updateProduct(id: number, input: ProductInput) {
  return api.put<Product>(`/admin/products/${id}`, input)
}

/** DELETE /api/admin/products/:id — xóa mềm để không làm mất lịch sử đơn hàng */
export function deleteProduct(id: number) {
  return api.delete<{ ok: true }>(`/admin/products/${id}`)
}

/** PATCH /api/admin/inventory/:id — đặt lại số lượng tồn kho */
export function updateStock(id: number, stock: number) {
  return api.patch<Product>(`/admin/inventory/${id}`, { stock })
}

// ================= Danh mục =================

/** GET /api/admin/categories — kèm số sản phẩm */
export function listCategories() {
  return api.get<(Category & { productCount: number })[]>('/admin/categories')
}

export type CategoryInput = Pick<Category, 'name' | 'parentId' | 'description'>

/** POST /api/admin/categories */
export function createCategory(input: CategoryInput) {
  return api.post<Category>('/admin/categories', input)
}

/** PUT /api/admin/categories/:id */
export function updateCategory(id: number, input: CategoryInput) {
  return api.put<Category>(`/admin/categories/${id}`, input)
}

/** DELETE /api/admin/categories/:id */
export function deleteCategory(id: number) {
  return api.delete<{ ok: true }>(`/admin/categories/${id}`)
}

// ================= Đơn hàng =================

export type AdminOrderRow = Order & { customerEmail: string }

/** GET /api/admin/orders?status= */
export function listOrders(status?: OrderStatus | '') {
  return api.get<AdminOrderRow[]>('/admin/orders', { status })
}

/** GET /api/admin/orders/:code — kèm tồn kho hiện tại để kiểm tra */
export function getOrder(code: string) {
  return api.get<{
    order: Order
    customer: Pick<User, 'id' | 'fullName' | 'email' | 'phone'> | null
    stock: Record<number, number>
  }>(`/admin/orders/${encodeURIComponent(code)}`)
}

/** PATCH /api/admin/orders/:code/status */
export function updateOrderStatus(code: string, status: OrderStatus, note = '') {
  return api.patch<Order>(`/admin/orders/${encodeURIComponent(code)}/status`, { status, note })
}

/** PATCH /api/admin/orders/:code/payment — quản lý thanh toán tách riêng với trạng thái đơn */
export function updatePaymentStatus(code: string, paymentStatus: PaymentStatus) {
  return api.patch<Order>(`/admin/orders/${encodeURIComponent(code)}/payment`, { paymentStatus })
}

// ================= Khách hàng (nâng cao) =================

/** GET /api/admin/customers */
export function listCustomers() {
  return api.get<(User & { orderCount: number; totalSpent: number })[]>('/admin/customers')
}

// ================= Khuyến mãi (nâng cao) =================

/** GET /api/admin/promotions */
export function getPromotionSettings() {
  return api.get<{ promotions: Promotion[]; settings: ShopSettings }>('/admin/promotions')
}

/** PUT /api/admin/promotions/:id */
export function updatePromotion(id: number, input: Omit<Promotion, 'id' | 'type'>) {
  return api.put<Promotion>(`/admin/promotions/${id}`, input)
}

/** PUT /api/admin/settings */
export function updateSettings(settings: ShopSettings) {
  return api.put<ShopSettings>('/admin/settings', { baseShippingFee: settings.baseShippingFee })
}
