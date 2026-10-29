import type { AttributeKey, Category, CategoryNode, Paginated, Product, ProductQuery } from '../types'
import { api } from './api'

export function buildTree(categories: Category[]): CategoryNode[] {
  return categories
    .filter((c) => c.parentId === null)
    .map((root) => ({ ...root, children: categories.filter((c) => c.parentId === root.id) }))
}

/** GET /api/categories */
export function getCategoryTree() {
  return api.get<CategoryNode[]>('/categories')
}

/** GET /api/categories/:slug */
export function getCategoryBySlug(slug: string) {
  return api.get<{ category: Category; parent: Category | null; children: Category[] }>(
    `/categories/${encodeURIComponent(slug)}`,
  )
}

export interface ProductListResult extends Paginated<Product> {
  facets: {
    brands: { value: string; count: number }[]
    attributes: Partial<Record<AttributeKey, string[]>>
  }
}

/** GET /api/products?category=&q=&brand=&price=&cpu=...&sort=&page= */
export function getProducts(query: ProductQuery): Promise<ProductListResult> {
  return api.get<ProductListResult>('/products', {
    category: query.categorySlug,
    q: query.q?.trim(),
    brand: query.brands,
    price: query.priceRange,
    stock: query.inStock,
    promo: query.promo,
    sort: query.sort,
    page: query.page,
    pageSize: query.pageSize,
    ...query.attrs,
  })
}

/** GET /api/products/:slug */
export function getProductBySlug(slug: string) {
  return api.get<{ product: Product; category: Category; parent: Category | null }>(
    `/products/${encodeURIComponent(slug)}`,
  )
}

/** GET /api/products/:id/related — cùng danh mục */
export function getRelatedProducts(product: Product) {
  return api.get<Product[]>(`/products/${product.id}/related`)
}

/** GET /api/products/accessories — gợi ý phụ kiện mua kèm (cơ hội "Combo" — LAB 1). */
export function getSuggestedAccessories(excludeIds: number[]) {
  return api.get<Product[]>('/products/accessories', { exclude: excludeIds.map(String) })
}

/** POST /api/products/by-ids — dùng cho giỏ hàng */
export function getProductsByIds(ids: number[]) {
  if (!ids.length) return Promise.resolve([] as Product[])
  return api.post<Product[]>('/products/by-ids', { ids })
}

export function getBestSellers(limit = 8, categorySlug?: string) {
  return getProducts({ categorySlug, sort: 'popular', pageSize: limit }).then((r) => r.items)
}
