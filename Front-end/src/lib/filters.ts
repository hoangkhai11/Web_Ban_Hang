import type { AttributeKey } from '../types'

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  cpu: 'Vi xử lý (CPU)',
  ram: 'Dung lượng RAM',
  storage: 'Dung lượng lưu trữ',
  storageType: 'Loại ổ cứng',
  gpu: 'Card đồ họa',
  vram: 'Bộ nhớ VRAM',
  ramType: 'Chuẩn RAM',
  socket: 'Socket',
  connection: 'Chuẩn kết nối',
  screenSize: 'Kích thước màn hình',
  resolution: 'Độ phân giải',
}

/**
 * Bộ lọc thuộc tính theo từng danh mục (LAB 6 — quy tắc 7: bộ lọc phải phù hợp loại sản phẩm).
 * Danh mục cấp 1 chỉ dùng các thuộc tính chung của nhóm.
 */
export const CATEGORY_FILTERS: Record<string, AttributeKey[]> = {
  'may-tinh-laptop': ['cpu', 'ram', 'storage'],
  laptop: ['cpu', 'ram', 'storage', 'screenSize', 'resolution'],
  'may-tinh-de-ban': ['cpu', 'ram', 'storage', 'gpu'],
  'may-tinh-mini': ['cpu', 'ram', 'storage'],
  'linh-kien-may-tinh': [],
  cpu: ['cpu', 'socket'],
  ram: ['ram', 'ramType'],
  'o-cung': ['storage', 'storageType'],
  'card-do-hoa': ['gpu', 'vram'],
  'phu-kien-may-tinh': ['connection'],
  'ban-phim': ['connection'],
  chuot: ['connection'],
  'tai-nghe': ['connection'],
  'man-hinh': ['screenSize', 'resolution'],
}

export const PRICE_RANGES = [
  { value: 'under-5', label: 'Dưới 5 triệu', min: 0, max: 5_000_000 },
  { value: '5-15', label: '5 - 15 triệu', min: 5_000_000, max: 15_000_000 },
  { value: 'over-15', label: 'Trên 15 triệu', min: 15_000_000, max: Infinity },
] as const

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Bán chạy nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
] as const

// Sắp xếp giá trị thuộc tính theo thứ tự tự nhiên (8 GB < 16 GB < 1 TB ...)
const toNumber = (v: string) => {
  const m = v.match(/([\d.]+)\s*(TB|GB|inch)?/i)
  if (!m) return NaN
  const n = parseFloat(m[1])
  return m[2]?.toUpperCase() === 'TB' ? n * 1024 : n
}
export const sortAttributeValues = (values: string[]) =>
  [...values].sort((a, b) => {
    const na = toNumber(a)
    const nb = toNumber(b)
    if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb
    return a.localeCompare(b, 'vi')
  })
