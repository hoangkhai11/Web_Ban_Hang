// Sao chép từ Front-end/src/data để FE (chế độ demo) và BE dùng chung một bộ dữ liệu mẫu.
import type { Product } from './types'

// Dữ liệu minh họa phục vụ LAB — giá không phải báo giá thực tế.
// Ảnh lấy từ Unsplash; nếu không tải được sẽ hiển thị ảnh thay thế /placeholder.svg.
const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`

const IMG = {
  laptop1: img('1496181133206-80ce9b88a853'),
  laptop2: img('1517336714731-489689fd1ca8'),
  laptop3: img('1593642632823-8f785ba67e45'),
  laptop4: img('1525547719571-a2d4ac8945e2'),
  laptop5: img('1603302576837-37561b2e2302'),
  laptop6: img('1588872657578-7efd1f1555ed'),
  pc1: img('1587202372775-e229f172b9d7'),
  pc2: img('1593640408182-31c70c8268f5'),
  mini: img('1629131726692-1accd0c53ce0'),
  cpu: img('1591799265444-d66432b91588'),
  ram: img('1562976540-1502c2145186'),
  ssd: img('1597872200969-2b65d56bd16b'),
  hdd: img('1531492746076-161ca9bcad58'),
  gpu: img('1591488320449-011701bb6704'),
  keyboard1: img('1587829741301-dc798b83add3'),
  keyboard2: img('1511467687858-23d96c32e4ae'),
  mouse1: img('1527864550417-7fd91fc51a46'),
  mouse2: img('1615663245857-ac93bb7c39e7'),
  headphone1: img('1505740420928-5e560c06d30e'),
  headphone2: img('1546435770-a3e426bf472b'),
  monitor1: img('1527443224154-c4a3942d3acf'),
  monitor2: img('1585792180666-f7347c490ee2'),
}

type Seed = Omit<Product, 'slug' | 'isActive' | 'soldCount' | 'createdAt'> &
  Partial<Pick<Product, 'soldCount' | 'createdAt'>>

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const seeds: Seed[] = [
  // ===== Laptop (11) =====
  {
    id: 1, code: 'LT-NB14-01', name: 'Laptop NovaBook 14 — Intel Core i5, RAM 16 GB, SSD 512 GB',
    categoryId: 11, brand: 'NovaBook', price: 14_990_000, stock: 25, warrantyMonths: 24,
    images: [IMG.laptop1, IMG.laptop4, IMG.laptop6],
    highlights: ['Intel Core i5', 'RAM 16 GB', 'SSD 512 GB', '14" Full HD'],
    description: 'NovaBook 14 là laptop mỏng nhẹ phù hợp cho sinh viên: học trực tuyến, làm bài tập, chạy các phần mềm văn phòng và lập trình cơ bản. Thời lượng pin cả ngày, trọng lượng khoảng 1,4 kg dễ mang theo.',
    specs: { 'CPU': 'Intel Core i5 (thế hệ 13)', 'RAM': '16 GB DDR5', 'Ổ cứng': 'SSD 512 GB NVMe', 'Màn hình': '14 inch Full HD IPS', 'Card đồ họa': 'Intel Iris Xe', 'Hệ điều hành': 'Windows 11 Home', 'Trọng lượng': '1,4 kg' },
    attributes: { cpu: 'Intel Core i5', ram: '16 GB', storage: '512 GB', storageType: 'SSD NVMe', screenSize: '14 inch', resolution: 'Full HD' },
    soldCount: 320, createdAt: '2026-08-01',
  },
  {
    id: 2, code: 'LT-DELL-I5', name: 'Laptop Dell Inspiron 15 3530 i5-1335U 8GB 512GB',
    categoryId: 11, brand: 'Dell', price: 15_490_000, stock: 18, warrantyMonths: 12,
    images: [IMG.laptop4, IMG.laptop1],
    highlights: ['Intel Core i5', 'RAM 8 GB', 'SSD 512 GB', '15.6" Full HD'],
    description: 'Dell Inspiron 15 bền bỉ, bàn phím có phím số tiện cho kế toán và văn phòng. Có thể nâng cấp RAM lên 16 GB.',
    specs: { 'CPU': 'Intel Core i5-1335U', 'RAM': '8 GB DDR4 (2 khe, tối đa 16 GB)', 'Ổ cứng': 'SSD 512 GB NVMe', 'Màn hình': '15.6 inch Full HD 120Hz', 'Card đồ họa': 'Intel Iris Xe', 'Hệ điều hành': 'Windows 11 Home', 'Trọng lượng': '1,65 kg' },
    attributes: { cpu: 'Intel Core i5', ram: '8 GB', storage: '512 GB', storageType: 'SSD NVMe', screenSize: '15.6 inch', resolution: 'Full HD' },
    soldCount: 210, createdAt: '2026-06-12',
  },
  {
    id: 3, code: 'LT-ASUS-VB', name: 'Laptop ASUS Vivobook 15 Ryzen 5 7520U 16GB 512GB',
    categoryId: 11, brand: 'ASUS', price: 12_490_000, stock: 30, warrantyMonths: 24,
    images: [IMG.laptop6, IMG.laptop3],
    highlights: ['AMD Ryzen 5', 'RAM 16 GB', 'SSD 512 GB', '15.6" Full HD'],
    description: 'Lựa chọn tiết kiệm cho học tập với chip AMD Ryzen 5 tiết kiệm điện, RAM 16 GB đa nhiệm tốt.',
    specs: { 'CPU': 'AMD Ryzen 5 7520U', 'RAM': '16 GB LPDDR5', 'Ổ cứng': 'SSD 512 GB NVMe', 'Màn hình': '15.6 inch Full HD', 'Card đồ họa': 'AMD Radeon 610M', 'Hệ điều hành': 'Windows 11 Home', 'Trọng lượng': '1,7 kg' },
    attributes: { cpu: 'AMD Ryzen 5', ram: '16 GB', storage: '512 GB', storageType: 'SSD NVMe', screenSize: '15.6 inch', resolution: 'Full HD' },
    soldCount: 410, createdAt: '2026-07-20',
  },
  {
    id: 4, code: 'LT-LNV-LOQ', name: 'Laptop Gaming Lenovo LOQ 15 i7-13650HX RTX 4060 16GB 1TB',
    categoryId: 11, brand: 'Lenovo', price: 32_990_000, stock: 6, warrantyMonths: 24,
    images: [IMG.laptop5, IMG.laptop3],
    highlights: ['Intel Core i7', 'RAM 16 GB', 'SSD 1 TB', 'RTX 4060'],
    description: 'Laptop gaming hiệu năng cao cho game AAA, dựng phim và đồ họa 3D. Tản nhiệt kép, màn hình 144Hz.',
    specs: { 'CPU': 'Intel Core i7-13650HX', 'RAM': '16 GB DDR5', 'Ổ cứng': 'SSD 1 TB NVMe', 'Màn hình': '15.6 inch Full HD 144Hz', 'Card đồ họa': 'NVIDIA GeForce RTX 4060 8GB', 'Hệ điều hành': 'Windows 11 Home', 'Trọng lượng': '2,4 kg' },
    attributes: { cpu: 'Intel Core i7', ram: '16 GB', storage: '1 TB', storageType: 'SSD NVMe', gpu: 'RTX 4060', screenSize: '15.6 inch', resolution: 'Full HD' },
    soldCount: 150, createdAt: '2026-09-05',
  },
  {
    id: 5, code: 'LT-ASUS-ZEN', name: 'Laptop ASUS Zenbook 14 OLED Core Ultra 7 32GB 1TB',
    categoryId: 11, brand: 'ASUS', price: 28_490_000, stock: 0, warrantyMonths: 24,
    images: [IMG.laptop2, IMG.laptop1],
    highlights: ['Intel Core i7', 'RAM 32 GB', 'SSD 1 TB', '14" OLED QHD'],
    description: 'Laptop doanh nhân siêu mỏng với màn hình OLED sắc nét, pin lâu, phù hợp người đi làm thường xuyên di chuyển.',
    specs: { 'CPU': 'Intel Core Ultra 7 155H', 'RAM': '32 GB LPDDR5X', 'Ổ cứng': 'SSD 1 TB NVMe', 'Màn hình': '14 inch OLED QHD+', 'Card đồ họa': 'Intel Arc', 'Hệ điều hành': 'Windows 11 Home', 'Trọng lượng': '1,2 kg' },
    attributes: { cpu: 'Intel Core i7', ram: '32 GB', storage: '1 TB', storageType: 'SSD NVMe', screenSize: '14 inch', resolution: 'QHD' },
    soldCount: 95, createdAt: '2026-09-28',
  },
  // ===== Máy tính để bàn (12) =====
  {
    id: 6, code: 'PC-OFFICE-I5', name: 'PC Văn phòng GICUNGCO Office i5-12400 16GB 512GB',
    categoryId: 12, brand: 'GICUNGCO', price: 11_990_000, stock: 12, warrantyMonths: 36,
    images: [IMG.pc2, IMG.pc1],
    highlights: ['Intel Core i5', 'RAM 16 GB', 'SSD 512 GB', 'Wi-Fi'],
    description: 'Cấu hình văn phòng ổn định do cửa hàng lắp ráp và kiểm tra, phù hợp kế toán, nhân viên hành chính và học sinh.',
    specs: { 'CPU': 'Intel Core i5-12400', 'Mainboard': 'B760M', 'RAM': '16 GB DDR4 3200', 'Ổ cứng': 'SSD 512 GB NVMe', 'Nguồn': '550W 80 Plus', 'Hệ điều hành': 'Không kèm' },
    attributes: { cpu: 'Intel Core i5', ram: '16 GB', storage: '512 GB', storageType: 'SSD NVMe' },
    soldCount: 180, createdAt: '2026-05-10',
  },
  {
    id: 7, code: 'PC-GAME-R7', name: 'PC Gaming GICUNGCO Storm Ryzen 7 7700 RTX 4070 32GB 1TB',
    categoryId: 12, brand: 'GICUNGCO', price: 42_500_000, stock: 4, warrantyMonths: 36,
    images: [IMG.pc1, IMG.pc2],
    highlights: ['AMD Ryzen 7', 'RAM 32 GB', 'SSD 1 TB', 'RTX 4070'],
    description: 'Cấu hình gaming 2K mượt mà, có thể stream và dựng video. Vỏ case kính cường lực, tản nhiệt khí hiệu quả.',
    specs: { 'CPU': 'AMD Ryzen 7 7700', 'Mainboard': 'B650M', 'RAM': '32 GB DDR5 6000', 'Ổ cứng': 'SSD 1 TB NVMe Gen4', 'Card đồ họa': 'NVIDIA RTX 4070 12GB', 'Nguồn': '750W 80 Plus Gold' },
    attributes: { cpu: 'AMD Ryzen 7', ram: '32 GB', storage: '1 TB', storageType: 'SSD NVMe', gpu: 'RTX 4070' },
    soldCount: 60, createdAt: '2026-09-15',
  },
  // ===== Máy tính mini (13) =====
  {
    id: 8, code: 'MINI-NUC-I5', name: 'Máy tính mini Intel NUC 13 Pro i5-1340P 16GB 512GB',
    categoryId: 13, brand: 'Intel', price: 13_490_000, stock: 9, warrantyMonths: 24,
    images: [IMG.mini, IMG.pc2],
    highlights: ['Intel Core i5', 'RAM 16 GB', 'SSD 512 GB', 'Siêu nhỏ gọn'],
    description: 'Máy tính mini gắn sau màn hình, phù hợp quầy thu ngân, văn phòng nhỏ hoặc làm máy chủ tại nhà.',
    specs: { 'CPU': 'Intel Core i5-1340P', 'RAM': '16 GB DDR4', 'Ổ cứng': 'SSD 512 GB NVMe', 'Kết nối': 'Wi-Fi 6E, Bluetooth 5.3, 2x HDMI', 'Kích thước': '117 x 112 x 37 mm' },
    attributes: { cpu: 'Intel Core i5', ram: '16 GB', storage: '512 GB', storageType: 'SSD NVMe' },
    soldCount: 45, createdAt: '2026-04-02',
  },
  // ===== CPU (21) =====
  {
    id: 9, code: 'LK-CPU-I5-14', name: 'CPU Intel Core i5-14400F (10 nhân, 16 luồng, LGA1700)',
    categoryId: 21, brand: 'Intel', price: 4_290_000, stock: 40, warrantyMonths: 36,
    images: [IMG.cpu],
    highlights: ['10 nhân / 16 luồng', 'Turbo 4.7 GHz', 'LGA1700', 'Không iGPU'],
    description: 'CPU tầm trung cho gaming và làm việc. Phiên bản F không có đồ họa tích hợp — cần card đồ họa rời.',
    specs: { 'Số nhân / luồng': '10 / 16', 'Xung nhịp tối đa': '4.7 GHz', 'Socket': 'LGA1700', 'TDP': '65W', 'Đồ họa tích hợp': 'Không' },
    attributes: { cpu: 'Intel Core i5', socket: 'LGA1700' },
    compatibilityNote: 'Tương thích mainboard socket LGA1700 (chipset H610, B660, B760, Z690, Z790). Cần card đồ họa rời.',
    soldCount: 260, createdAt: '2026-03-01',
  },
  {
    id: 10, code: 'LK-CPU-R5-76', name: 'CPU AMD Ryzen 5 7600 (6 nhân, 12 luồng, AM5)',
    categoryId: 21, brand: 'AMD', price: 5_190_000, stock: 22, warrantyMonths: 36,
    images: [IMG.cpu],
    highlights: ['6 nhân / 12 luồng', 'Turbo 5.1 GHz', 'AM5', 'Kèm tản nhiệt'],
    description: 'CPU nền tảng AM5 hỗ trợ DDR5 và PCIe 5.0, kèm tản nhiệt Wraith Stealth.',
    specs: { 'Số nhân / luồng': '6 / 12', 'Xung nhịp tối đa': '5.1 GHz', 'Socket': 'AM5', 'TDP': '65W', 'Đồ họa tích hợp': 'AMD Radeon' },
    attributes: { cpu: 'AMD Ryzen 5', socket: 'AM5' },
    compatibilityNote: 'Chỉ hỗ trợ RAM DDR5 và mainboard socket AM5 (A620, B650, X670).',
    soldCount: 140, createdAt: '2026-06-01',
  },
  // ===== RAM (22) =====
  {
    id: 11, code: 'LK-RAM-16D5', name: 'RAM Kingston FURY Beast 16GB DDR5 5600MHz',
    categoryId: 22, brand: 'Kingston', price: 1_390_000, stock: 60, warrantyMonths: 36,
    images: [IMG.ram],
    highlights: ['16 GB', 'DDR5', '5600 MHz', 'Tản nhiệt nhôm'],
    description: 'Thanh RAM DDR5 hiệu năng cao cho PC thế hệ mới.',
    specs: { 'Dung lượng': '16 GB (1 x 16 GB)', 'Chuẩn': 'DDR5', 'Bus': '5600 MHz', 'Điện áp': '1.25V' },
    attributes: { ram: '16 GB', ramType: 'DDR5' },
    compatibilityNote: 'Chỉ dùng cho mainboard hỗ trợ DDR5. Không lắp được vào khe DDR4.',
    soldCount: 330, createdAt: '2026-02-10',
  },
  {
    id: 12, code: 'LK-RAM-8D4', name: 'RAM Laptop Samsung 8GB DDR4 3200MHz SODIMM',
    categoryId: 22, brand: 'Samsung', price: 590_000, stock: 3, warrantyMonths: 36,
    images: [IMG.ram],
    highlights: ['8 GB', 'DDR4', '3200 MHz', 'SODIMM (laptop)'],
    description: 'RAM nâng cấp cho laptop sử dụng khe SODIMM DDR4.',
    specs: { 'Dung lượng': '8 GB', 'Chuẩn': 'DDR4 SODIMM', 'Bus': '3200 MHz', 'Điện áp': '1.2V' },
    attributes: { ram: '8 GB', ramType: 'DDR4' },
    compatibilityNote: 'Dành cho laptop có khe RAM rời DDR4 SODIMM. Kiểm tra laptop còn khe trống trước khi mua.',
    soldCount: 220, createdAt: '2026-01-15',
  },
  // ===== Ổ cứng (23) =====
  {
    id: 13, code: 'LK-SSD-01', name: 'SSD FastDrive 1TB NVMe M.2',
    categoryId: 23, brand: 'FastDrive', price: 1_590_000, stock: 50, warrantyMonths: 60,
    images: [IMG.ssd, IMG.hdd],
    highlights: ['1 TB', 'M.2 2280', 'NVMe PCIe', '3500 MB/s'],
    description: 'SSD NVMe tốc độ cao giúp khởi động Windows và mở phần mềm nhanh hơn nhiều lần so với HDD.',
    specs: { 'Dung lượng': '1 TB', 'Chuẩn kết nối': 'M.2 2280 NVMe PCIe', 'Tốc độ đọc': '3500 MB/s', 'Tốc độ ghi': '3000 MB/s' },
    attributes: { storage: '1 TB', storageType: 'SSD NVMe' },
    compatibilityNote: 'Yêu cầu khe M.2 hỗ trợ NVMe (PCIe). Không dùng được với khe M.2 chỉ hỗ trợ SATA.',
    soldCount: 380, createdAt: '2026-07-01',
  },
  {
    id: 14, code: 'LK-SSD-SATA', name: 'SSD Samsung 870 EVO 512GB SATA 2.5"',
    categoryId: 23, brand: 'Samsung', price: 1_290_000, stock: 35, warrantyMonths: 60,
    images: [IMG.ssd],
    highlights: ['512 GB', 'SATA III', '2.5 inch', '560 MB/s'],
    description: 'SSD SATA phổ biến để nâng cấp laptop/PC đời cũ dùng HDD.',
    specs: { 'Dung lượng': '512 GB', 'Chuẩn kết nối': 'SATA III 6Gb/s', 'Kích thước': '2.5 inch', 'Tốc độ đọc': '560 MB/s' },
    attributes: { storage: '512 GB', storageType: 'SSD SATA' },
    soldCount: 190, createdAt: '2026-03-20',
  },
  {
    id: 15, code: 'LK-HDD-1TB', name: 'Ổ cứng HDD WD Blue 1TB 7200rpm',
    categoryId: 23, brand: 'WD', price: 1_150_000, stock: 20, warrantyMonths: 24,
    images: [IMG.hdd],
    highlights: ['1 TB', 'SATA III', '3.5 inch', '7200 rpm'],
    description: 'Ổ cứng lưu trữ dung lượng lớn với chi phí thấp, phù hợp lưu tài liệu, ảnh, video.',
    specs: { 'Dung lượng': '1 TB', 'Chuẩn kết nối': 'SATA III', 'Kích thước': '3.5 inch', 'Tốc độ quay': '7200 rpm' },
    attributes: { storage: '1 TB', storageType: 'HDD' },
    soldCount: 75, createdAt: '2025-12-01',
  },
  // ===== Card đồ họa (24) =====
  {
    id: 16, code: 'LK-VGA-4060', name: 'Card đồ họa ASUS Dual GeForce RTX 4060 8GB',
    categoryId: 24, brand: 'ASUS', price: 8_490_000, stock: 10, warrantyMonths: 36,
    images: [IMG.gpu],
    highlights: ['RTX 4060', '8 GB GDDR6', 'DLSS 3', 'Nguồn đề nghị 550W'],
    description: 'Card đồ họa chơi game Full HD/2K, hỗ trợ ray tracing và DLSS 3.',
    specs: { 'GPU': 'NVIDIA GeForce RTX 4060', 'Bộ nhớ': '8 GB GDDR6', 'Cổng xuất hình': 'HDMI 2.1, 3x DisplayPort 1.4a', 'Nguồn đề nghị': '550W' },
    attributes: { gpu: 'RTX 4060', vram: '8 GB' },
    compatibilityNote: 'Cần khe PCIe x16 và nguồn tối thiểu 550W có đầu 8-pin.',
    soldCount: 170, createdAt: '2026-08-15',
  },
  {
    id: 17, code: 'LK-VGA-4070S', name: 'Card đồ họa MSI GeForce RTX 4070 SUPER 12GB',
    categoryId: 24, brand: 'MSI', price: 17_990_000, stock: 5, warrantyMonths: 36,
    images: [IMG.gpu],
    highlights: ['RTX 4070 SUPER', '12 GB GDDR6X', 'DLSS 3', 'Nguồn đề nghị 650W'],
    description: 'Hiệu năng mạnh cho game 2K tối đa thiết lập và các tác vụ AI, render.',
    specs: { 'GPU': 'NVIDIA GeForce RTX 4070 SUPER', 'Bộ nhớ': '12 GB GDDR6X', 'Cổng xuất hình': 'HDMI 2.1, 3x DisplayPort', 'Nguồn đề nghị': '650W' },
    attributes: { gpu: 'RTX 4070 SUPER', vram: '12 GB' },
    compatibilityNote: 'Card dài 30 cm — kiểm tra kích thước vỏ case. Nguồn tối thiểu 650W.',
    soldCount: 55, createdAt: '2026-09-01',
  },
  // ===== Bàn phím (31) =====
  {
    id: 18, code: 'PK-KB-LOGI', name: 'Bàn phím không dây Logitech MX Keys S',
    categoryId: 31, brand: 'Logitech', price: 2_790_000, stock: 15, warrantyMonths: 12,
    images: [IMG.keyboard2, IMG.keyboard1],
    highlights: ['Bluetooth', '2.4 GHz', 'Đèn nền', 'Kết nối 3 thiết bị'],
    description: 'Bàn phím văn phòng cao cấp, gõ êm, đèn nền tự động, dùng cho Windows và macOS.',
    specs: { 'Kết nối': 'Bluetooth, Logi Bolt 2.4 GHz', 'Pin': 'Sạc USB-C, tối đa 10 ngày (bật đèn)', 'Tương thích': 'Windows, macOS, Linux' },
    attributes: { connection: 'Bluetooth' },
    soldCount: 120, createdAt: '2026-05-05',
  },
  {
    id: 19, code: 'PK-KB-AKKO', name: 'Bàn phím cơ AKKO 3087 v2 có dây',
    categoryId: 31, brand: 'AKKO', price: 990_000, stock: 28, warrantyMonths: 12,
    images: [IMG.keyboard1],
    highlights: ['USB', 'Switch cơ', 'TKL 87 phím', 'Keycap PBT'],
    description: 'Bàn phím cơ TKL gọn gàng, gõ sướng tay cho game thủ và lập trình viên.',
    specs: { 'Kết nối': 'USB Type-C có dây', 'Layout': 'TKL 87 phím', 'Switch': 'AKKO CS Jelly', 'Keycap': 'PBT Double-shot' },
    attributes: { connection: 'USB' },
    soldCount: 240, createdAt: '2026-04-18',
  },
  // ===== Chuột (32) =====
  {
    id: 20, code: 'PK-MS-LOGI', name: 'Chuột không dây Logitech M331 Silent Plus',
    categoryId: 32, brand: 'Logitech', price: 350_000, stock: 80, warrantyMonths: 12,
    images: [IMG.mouse1, IMG.mouse2],
    highlights: ['2.4 GHz', 'Click yên tĩnh', 'Pin 24 tháng', '1000 DPI'],
    description: 'Chuột không dây giảm 90% tiếng click, phù hợp học tập trên thư viện, văn phòng.',
    specs: { 'Kết nối': 'USB receiver 2.4 GHz', 'DPI': '1000', 'Pin': '1 x AA, tối đa 24 tháng' },
    attributes: { connection: '2.4 GHz' },
    soldCount: 520, createdAt: '2026-01-05',
  },
  {
    id: 21, code: 'PK-MS-G102', name: 'Chuột gaming Logitech G102 Lightsync có dây',
    categoryId: 32, brand: 'Logitech', price: 399_000, stock: 0, warrantyMonths: 24,
    images: [IMG.mouse2],
    highlights: ['USB', '8000 DPI', 'RGB Lightsync', '6 nút'],
    description: 'Chuột gaming quốc dân, nhẹ, cảm biến chính xác.',
    specs: { 'Kết nối': 'USB có dây', 'DPI': '200 - 8000', 'Số nút': '6', 'Đèn': 'RGB Lightsync' },
    attributes: { connection: 'USB' },
    soldCount: 610, createdAt: '2025-11-11',
  },
  // ===== Tai nghe (33) =====
  {
    id: 22, code: 'PK-HP-HX', name: 'Tai nghe HyperX Cloud III có dây',
    categoryId: 33, brand: 'HyperX', price: 2_190_000, stock: 14, warrantyMonths: 24,
    images: [IMG.headphone2, IMG.headphone1],
    highlights: ['USB / 3.5mm', 'Mic khử ồn', 'Âm thanh 7.1', 'Đệm memory foam'],
    description: 'Tai nghe gaming đeo thoải mái nhiều giờ, mic rõ ràng phù hợp học và họp trực tuyến.',
    specs: { 'Kết nối': 'USB-C, USB-A, 3.5mm', 'Driver': '53 mm', 'Micro': 'Tháo rời, khử ồn' },
    attributes: { connection: 'USB' },
    soldCount: 88, createdAt: '2026-06-20',
  },
  {
    id: 23, code: 'PK-HP-SONY', name: 'Tai nghe Bluetooth Sony WH-CH720N chống ồn',
    categoryId: 33, brand: 'Sony', price: 2_490_000, stock: 11, warrantyMonths: 12,
    images: [IMG.headphone1],
    highlights: ['Bluetooth 5.2', 'Chống ồn ANC', 'Pin 35 giờ', 'Nhẹ 192g'],
    description: 'Tai nghe chống ồn chủ động giúp tập trung học tập, làm việc nơi đông người.',
    specs: { 'Kết nối': 'Bluetooth 5.2, 3.5mm', 'Pin': 'Tối đa 35 giờ', 'Trọng lượng': '192 g' },
    attributes: { connection: 'Bluetooth' },
    soldCount: 70, createdAt: '2026-08-25',
  },
  // ===== Màn hình (34) =====
  {
    id: 24, code: 'PK-MN-DELL27', name: 'Màn hình Dell UltraSharp U2724D 27" QHD IPS',
    categoryId: 34, brand: 'Dell', price: 9_890_000, stock: 8, warrantyMonths: 36,
    images: [IMG.monitor1, IMG.monitor2],
    highlights: ['27 inch', 'QHD 2560x1440', 'IPS 120Hz', 'USB-C'],
    description: 'Màn hình đồ họa chuẩn màu, phù hợp thiết kế và làm việc văn phòng chuyên nghiệp.',
    specs: { 'Kích thước': '27 inch', 'Độ phân giải': 'QHD 2560 x 1440', 'Tấm nền': 'IPS Black', 'Tần số quét': '120Hz', 'Cổng': 'HDMI, DisplayPort, USB-C' },
    attributes: { screenSize: '27 inch', resolution: 'QHD' },
    soldCount: 65, createdAt: '2026-07-12',
  },
  {
    id: 25, code: 'PK-MN-LG24', name: 'Màn hình LG 24MR400 24" Full HD IPS 100Hz',
    categoryId: 34, brand: 'LG', price: 2_390_000, stock: 26, warrantyMonths: 24,
    images: [IMG.monitor2],
    highlights: ['24 inch', 'Full HD', 'IPS 100Hz', 'HDMI'],
    description: 'Màn hình phổ thông giá tốt cho học sinh, sinh viên và văn phòng.',
    specs: { 'Kích thước': '23.8 inch', 'Độ phân giải': 'Full HD 1920 x 1080', 'Tấm nền': 'IPS', 'Tần số quét': '100Hz', 'Cổng': 'HDMI, D-Sub' },
    attributes: { screenSize: '24 inch', resolution: 'Full HD' },
    soldCount: 290, createdAt: '2026-02-28',
  },
  {
    id: 26, code: 'PK-MN-SS32', name: 'Màn hình Samsung ViewFinity S8 32" 4K UHD',
    categoryId: 34, brand: 'Samsung', price: 10_990_000, stock: 4, warrantyMonths: 24,
    images: [IMG.monitor1],
    highlights: ['32 inch', '4K UHD', 'VA HDR10', 'USB-C 90W'],
    description: 'Màn hình 4K kích thước lớn cho dựng phim, lập trình đa cửa sổ.',
    specs: { 'Kích thước': '32 inch', 'Độ phân giải': '4K 3840 x 2160', 'Tấm nền': 'VA', 'Cổng': 'HDMI, DisplayPort, USB-C 90W' },
    attributes: { screenSize: '32 inch', resolution: '4K' },
    soldCount: 30, createdAt: '2026-10-01',
  },
]

export const seedProducts: Product[] = seeds.map((s) => ({
  soldCount: 0,
  createdAt: '2026-01-01',
  ...s,
  slug: slugify(s.code + '-' + s.name),
  isActive: true,
}))

export { slugify }
