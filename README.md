# GICUNGCO — Website bán máy tính, laptop & linh kiện (B2C)

Website thương mại điện tử bán laptop, PC, linh kiện và phụ kiện máy tính, gồm cửa hàng cho khách và trang quản trị cho Admin.

| Thành phần | Công nghệ |
|---|---|
| [Front-end](Front-end/) | React 19 · TypeScript · Vite · Tailwind CSS · React Router |
| [Back-end](Back-end/) | NestJS · Prisma ORM · MySQL · JWT |

## Tính năng

**Khách hàng**
- Duyệt sản phẩm theo danh mục 2 cấp, tìm theo tên / mã / thông số
- Lọc theo thương hiệu, khoảng giá, cấu hình (CPU, RAM, ổ cứng, GPU...), còn hàng, khuyến mãi; sắp xếp, phân trang
- Giỏ hàng, gợi ý phụ kiện mua kèm, đặt hàng thanh toán khi nhận hàng (COD)
- Đăng ký / đăng nhập, cập nhật thông tin, xem lịch sử và theo dõi trạng thái đơn, hủy đơn khi còn chờ xác nhận

**Quản trị (Admin)**
- Dashboard: doanh thu, đơn theo trạng thái, doanh thu 7 ngày, sản phẩm sắp hết hàng
- Quản lý sản phẩm, tồn kho, danh mục
- Xử lý đơn hàng theo quy trình: Chờ xác nhận → Đã xác nhận → Đang xử lý → Đang giao → Hoàn thành (hoặc Hủy)
- Quản lý trạng thái thanh toán, khách hàng, chương trình khuyến mãi và phí vận chuyển

## Cấu trúc

```
├── Back-end/    REST API NestJS (tiền tố /api) + Prisma schema, migration, dữ liệu mẫu
└── Front-end/   Giao diện React; src/services/ gọi API Back-end
```

## Cài đặt & chạy

**Yêu cầu:** Node.js 20+, MySQL 8.

### 1. Back-end

```bash
cd Back-end
npm install
cp .env.example .env        # điền DATABASE_URL (mật khẩu MySQL) và JWT_SECRET

# tạo database (một lần)
mysql -uroot -p -e "CREATE DATABASE gicungco CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

npx prisma generate
npm run db:migrate          # tạo bảng
npm run db:seed             # nạp dữ liệu mẫu
npm run start:dev           # http://localhost:3000/api
```

### 2. Front-end

```bash
cd Front-end
npm install
npm run dev                 # http://localhost:5173
```

Khi chạy dev, Vite chuyển tiếp các request `/api` sang `http://localhost:3000`, nên không cần cấu hình CORS.
Nếu deploy Front-end và Back-end ở hai địa chỉ khác nhau, đặt `VITE_API_URL` cho Front-end và thêm domain Front-end vào `CORS_ORIGIN` của Back-end.

### Tài khoản thử nghiệm (sau khi seed)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@gicungco.vn | Admin@123 |
| Khách hàng | khachhang@gicungco.vn | Khach@123 |

Trang quản trị: http://localhost:5173/admin

## Tài liệu chi tiết

- [Back-end/README.md](Back-end/README.md): ERD, danh sách API, quy tắc lỗi và nghiệp vụ
- [Front-end/README.md](Front-end/README.md): cấu trúc thư mục và quy tắc nghiệp vụ phía giao diện
