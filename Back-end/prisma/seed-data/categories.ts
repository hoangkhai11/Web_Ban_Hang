// Sao chép từ Front-end/src/data để FE (chế độ demo) và BE dùng chung một bộ dữ liệu mẫu.
import type { Category } from './types'

// Cây danh mục LAB 6: đúng 3 danh mục cấp 1, mỗi nhóm tối đa 4 danh mục con, tối đa 2 cấp.
export const seedCategories: Category[] = [
  { id: 1, slug: 'may-tinh-laptop', name: 'Máy tính & Laptop', parentId: null, icon: 'Laptop', description: 'Laptop, máy tính để bàn và máy tính mini cho học tập, làm việc và giải trí.' },
  { id: 2, slug: 'linh-kien-may-tinh', name: 'Linh kiện máy tính', parentId: null, icon: 'Cpu', description: 'CPU, RAM, ổ cứng và card đồ họa để lắp ráp hoặc nâng cấp máy tính.' },
  { id: 3, slug: 'phu-kien-may-tinh', name: 'Phụ kiện máy tính', parentId: null, icon: 'Keyboard', description: 'Bàn phím, chuột, tai nghe và màn hình.' },

  { id: 11, slug: 'laptop', name: 'Laptop', parentId: 1, icon: 'Laptop', description: 'Laptop học tập, văn phòng và gaming.' },
  { id: 12, slug: 'may-tinh-de-ban', name: 'Máy tính để bàn', parentId: 1, icon: 'Monitor', description: 'PC lắp sẵn cho văn phòng và gaming.' },
  { id: 13, slug: 'may-tinh-mini', name: 'Máy tính mini', parentId: 1, icon: 'Box', description: 'Máy tính nhỏ gọn, tiết kiệm không gian.' },

  { id: 21, slug: 'cpu', name: 'CPU', parentId: 2, icon: 'Cpu', description: 'Bộ vi xử lý Intel và AMD.' },
  { id: 22, slug: 'ram', name: 'RAM', parentId: 2, icon: 'MemoryStick', description: 'Bộ nhớ RAM DDR4, DDR5.' },
  { id: 23, slug: 'o-cung', name: 'Ổ cứng', parentId: 2, icon: 'HardDrive', description: 'SSD NVMe, SSD SATA và HDD.' },
  { id: 24, slug: 'card-do-hoa', name: 'Card đồ họa', parentId: 2, icon: 'Gpu', description: 'Card đồ họa NVIDIA và AMD.' },

  { id: 31, slug: 'ban-phim', name: 'Bàn phím', parentId: 3, icon: 'Keyboard', description: 'Bàn phím cơ, bàn phím văn phòng.' },
  { id: 32, slug: 'chuot', name: 'Chuột', parentId: 3, icon: 'Mouse', description: 'Chuột có dây, không dây.' },
  { id: 33, slug: 'tai-nghe', name: 'Tai nghe', parentId: 3, icon: 'Headphones', description: 'Tai nghe gaming, tai nghe học trực tuyến.' },
  { id: 34, slug: 'man-hinh', name: 'Màn hình', parentId: 3, icon: 'MonitorSmartphone', description: 'Màn hình Full HD, QHD, 4K.' },
]
