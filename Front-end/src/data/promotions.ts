import type { Promotion, ShopSettings } from '../types'

// 2 chương trình khuyến mãi theo LAB 3 — Mục tiêu 3.
// Ngưỡng miễn phí vận chuyển là GIÁ TRỊ CẤU HÌNH DEMO (Admin có thể sửa), không phải yêu cầu gốc của LAB.
export const seedPromotions: Promotion[] = [
  {
    id: 1,
    name: 'Giảm 5% sản phẩm chọn lọc',
    type: 'PRODUCT_PERCENT',
    value: 5,
    minOrderValue: 0,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    isActive: true,
    productIds: [1, 3, 9, 13, 20, 25],
    description: 'Giảm trực tiếp 5% trên giá niêm yết cho các sản phẩm được gắn nhãn "-5%".',
    conditions: [
      'Chỉ áp dụng cho sản phẩm có nhãn "-5%" trong danh sách bên dưới.',
      'Giá sau giảm được hệ thống tính tự động khi thêm vào giỏ hàng.',
      'Không quy đổi thành tiền mặt.',
    ],
  },
  {
    id: 2,
    name: 'Miễn phí vận chuyển',
    type: 'FREE_SHIPPING',
    value: 0,
    minOrderValue: 5_000_000,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    isActive: true,
    productIds: [],
    description: 'Miễn phí vận chuyển toàn quốc cho đơn hàng đạt giá trị tối thiểu.',
    conditions: [
      'Giá trị hàng hóa (sau giảm giá sản phẩm) đạt ngưỡng tối thiểu.',
      'Áp dụng cho mọi sản phẩm và phương thức thanh toán COD.',
      'Ngưỡng có thể được cửa hàng điều chỉnh trong trang quản trị.',
    ],
  },
]

// Phí vận chuyển cố định của cửa hàng (chưa tích hợp đơn vị vận chuyển thật).
export const seedSettings: ShopSettings = {
  baseShippingFee: 30_000,
}
