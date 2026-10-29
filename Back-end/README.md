# GICUNGCO — Back-end (NestJS + Prisma + MySQL)

REST API cho website bán máy tính GICUNGCO (B2C). Mọi đường dẫn có tiền tố `/api`.

## Cài đặt & chạy

```bash
npm install
npx prisma generate                 # sinh Prisma Client
cp .env.example .env                # rồi điền mật khẩu MySQL, JWT_SECRET

# Tạo database (một lần)
mysql -uroot -p -e "CREATE DATABASE gicungco CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

npm run db:migrate                  # tạo bảng (prisma migrate deploy)
npm run db:seed                     # nạp dữ liệu mẫu — XÓA dữ liệu cũ trong các bảng
npm run start:dev                   # http://localhost:3000/api
node test/api-test.mjs              # 60 kịch bản kiểm thử API (cần API đang chạy)
```

`.env`: `DATABASE_URL` (ký tự đặc biệt trong mật khẩu phải mã hóa URL, VD `@` → `%40`), `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CORS_ORIGIN`.

### Tài khoản thử nghiệm (sau khi seed)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@gicungco.vn | Admin@123 |
| Khách hàng | khachhang@gicungco.vn | Khach@123 |

## ERD

```mermaid
erDiagram
  categories ||--o{ categories : "cha - con (tối đa 2 cấp)"
  categories ||--o{ products : "có"
  products ||--o{ product_attributes : "thuộc tính lọc"
  users ||--o{ orders : "đặt"
  orders ||--|{ order_items : "gồm"
  products ||--o{ order_items : "được mua"
  orders ||--o{ order_status_history : "lịch sử"
  promotions ||--o{ promotion_products : "áp dụng"
  products ||--o{ promotion_products : ""

  categories { int id PK; varchar slug UK; varchar name; int parent_id FK }
  products { int id PK; varchar code UK; varchar slug UK; int category_id FK; varchar brand; int price; int stock; json images; json specs; bool is_active }
  product_attributes { int product_id PK,FK; varchar key PK; varchar value }
  users { int id PK; varchar email UK; varchar password_hash; enum role }
  orders { int id PK; varchar code UK; int user_id FK; int subtotal; int discount_total; int shipping_fee; int total; enum status; enum payment_method; enum payment_status; bool stock_released }
  order_items { int id PK; int order_id FK; int product_id FK; int original_price; int unit_price; int quantity; int line_total }
  order_status_history { int id PK; int order_id FK; enum status; varchar note }
  promotions { int id PK; enum type; int value; int min_order_value; date start_date; date end_date; bool is_active }
  promotion_products { int promotion_id PK,FK; int product_id PK,FK }
  settings { varchar key PK; varchar value }
```

- `users` đóng vai trò thực thể **Customers** của LAB 4 (cột `role` phân biệt khách/admin).
- `order_items` lưu **đơn giá tại thời điểm mua** nên đơn cũ không đổi khi giá sản phẩm thay đổi.
- Xóa sản phẩm là **xóa mềm** (`is_active = false`) để giữ lịch sử đơn hàng.

## Danh sách API

| Phương thức | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | /health | — | Kiểm tra API + kết nối MySQL |
| GET | /categories | — | Cây danh mục |
| GET | /categories/:slug | — | Danh mục + cha + con |
| GET | /products | — | Danh sách; query: `category, q, brand, price (under-5\|5-15\|over-15), cpu, ram, storage, storageType, gpu, vram, ramType, socket, connection, screenSize, resolution, stock=1, promo=1, sort (popular\|newest\|price-asc\|price-desc), page, pageSize`. Trả `items, total, page, totalPages, facets` |
| GET | /products/:slug | — | Chi tiết theo slug **hoặc mã** sản phẩm |
| GET | /products/:id/related | — | Sản phẩm cùng danh mục |
| GET | /products/accessories?exclude= | — | Gợi ý phụ kiện mua kèm |
| POST | /products/by-ids | — | `{ ids }` — thông tin sản phẩm trong giỏ |
| GET | /promotions | — | Chương trình + điều kiện + sản phẩm áp dụng |
| GET | /promotions/pricing-context | — | Khuyến mãi + phí ship (hiển thị giá) |
| POST | /promotions/quote | — | `{ items: [{productId, quantity}] }` → tạm tính, giảm giá, phí ship, tổng |
| POST | /auth/register | — | Đăng ký → `{ accessToken, user }` |
| POST | /auth/login | — | `{ email, password, admin? }` → `{ accessToken, user }` |
| POST | /auth/logout | — | Client xóa token |
| GET / PATCH | /auth/me | Đăng nhập | Xem / cập nhật thông tin cá nhân |
| POST | /auth/forgot-password | — | (Nâng cao) chưa gửi email thật |
| POST | /orders | Đăng nhập | Tạo đơn COD `{ items, shipping }` |
| GET | /orders/my | Đăng nhập | Lịch sử đơn |
| GET | /orders/my/:code | Đăng nhập | Chi tiết + theo dõi (chỉ đơn của mình) |
| PATCH | /orders/my/:code/cancel | Đăng nhập | Hủy khi còn PENDING |
| GET | /admin/dashboard | ADMIN | Thống kê, doanh thu 7 ngày, sắp hết hàng |
| GET/POST | /admin/products | ADMIN | Danh sách / thêm sản phẩm |
| GET/PUT/DELETE | /admin/products/:id | ADMIN | Xem / sửa / xóa mềm |
| PATCH | /admin/inventory/:id | ADMIN | `{ stock }` |
| GET/POST | /admin/categories | ADMIN | Danh sách / thêm danh mục con |
| PUT/DELETE | /admin/categories/:id | ADMIN | Sửa / xóa |
| GET | /admin/orders?status= | ADMIN | Danh sách đơn |
| GET | /admin/orders/:code | ADMIN | Chi tiết + tồn kho hiện tại |
| PATCH | /admin/orders/:code/status | ADMIN | `{ status, note }` theo quy trình |
| PATCH | /admin/orders/:code/payment | ADMIN | `{ paymentStatus }` |
| GET | /admin/customers | ADMIN | (Nâng cao) khách hàng |
| GET | /admin/promotions · PUT /admin/promotions/:id · PUT /admin/settings | ADMIN | (Nâng cao) khuyến mãi, phí ship |

**Quy tắc lỗi**: `400` dữ liệu không hợp lệ (DTO) · `401` chưa đăng nhập/token sai · `403` sai vai trò · `404` không tìm thấy (kể cả đơn của người khác) · `409` xung đột (trùng email/mã, hết hàng, sai quy trình trạng thái). Body lỗi: `{ statusCode, message }` — `message` bằng tiếng Việt, hiển thị trực tiếp được.

## Quy tắc nghiệp vụ

- **Không tin dữ liệu client**: `ValidationPipe({ whitelist: true })` loại bỏ trường lạ (`price`, `total`, `role`...). Giá, khuyến mãi, phí ship, tổng tiền luôn tính lại ở server (`src/common/pricing.ts` — trùng công thức với FE).
- **Giảm 5%** chỉ cho sản phẩm thuộc chương trình đang hiệu lực. **Miễn phí ship** khi tiền hàng sau giảm ≥ ngưỡng cấu hình.
- **Tồn kho**: trừ trong transaction khi tạo đơn bằng `UPDATE ... WHERE stock >= qty` (chống bán vượt tồn khi nhiều người đặt cùng lúc); hoàn lại đúng một lần khi hủy (cờ `stock_released`).
- **Trạng thái đơn**: PENDING → CONFIRMED → PROCESSING → SHIPPING → COMPLETED; hủy được trước COMPLETED. **Thanh toán** tách riêng: COD tạo đơn = UNPAID, hoàn thành = PAID, hủy đơn đã thu = REFUNDED.
- **Doanh thu** chỉ tính đơn COMPLETED.
- **Danh mục**: cố định 3 cấp 1, tối đa 4 con/nhóm, không quá 2 cấp; không xóa danh mục đang có sản phẩm.

## Cấu trúc

```
prisma/  schema.prisma · migrations/ · seed.ts · seed-data/ (chung dữ liệu với FE)
src/
├── main.ts              tiền tố /api, CORS, ValidationPipe, xử lý lỗi Prisma
├── app.module.ts        ghép module + /health
├── prisma/              PrismaService (kết nối MySQL)
├── common/              pricing, trạng thái đơn, mapper → JSON giống types của FE
├── auth/                đăng ký/đăng nhập, JWT, JwtAuthGuard, RolesGuard
├── categories/ products/ promotions/ orders/ admin/
test/api-test.mjs        kiểm thử API end-to-end
```
