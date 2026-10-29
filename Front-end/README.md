# GICUNGCO — Front-end (React + TypeScript + Vite)

Website bán máy tính, laptop, linh kiện và phụ kiện (mô hình B2C).

## Chạy

Cần chạy Back-end trước (xem `../Back-end/README.md`, mặc định `http://localhost:3000/api`).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # kiểm tra TypeScript + build production
```

## Kết nối Back-end

Các hàm trong `src/services/*.ts` gọi REST API NestJS qua `src/services/api.ts`
(gắn JWT `Authorization: Bearer <token>`, lỗi `{ statusCode, message }` được hiển thị trực tiếp).

- Khi dev, FE gọi `/api/...` và Vite **proxy** sang `http://localhost:3000` (`vite.config.ts`).
- Khi deploy riêng, đặt biến `VITE_API_URL` (VD `VITE_API_URL=https://api.example.com/api`)
  và thêm domain FE vào `CORS_ORIGIN` của Back-end.

Muốn khôi phục dữ liệu mẫu: chạy `npm run db:seed` ở thư mục Back-end.

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@gicungco.vn | Admin@123 |
| Khách hàng | khachhang@gicungco.vn | Khach@123 |

## Cấu trúc thư mục

```
src/
├── types/          Kiểu dữ liệu dùng chung (khớp với bảng MySQL dự kiến)
├── data/           Dữ liệu mẫu: 14 danh mục (LAB 6), 26 sản phẩm, 2 khuyến mãi, 2 tài khoản
├── lib/            Logic thuần: tính tiền & khuyến mãi (pricing.ts), bộ lọc, trạng thái đơn, định dạng
├── services/       Lớp gọi REST API (api.ts + từng nhóm) — catalog, auth, order, promotion, admin
├── context/        Trạng thái toàn cục: đăng nhập, giỏ hàng, khuyến mãi, thông báo
├── hooks/          useAsync — quản lý trạng thái đang tải / lỗi
├── components/     layout (Header, Footer, AdminLayout, Guards), common, product
└── pages/          customer, account, info, admin
```

## Quy tắc nghiệp vụ đã cài đặt

- **Giảm 5%**: chỉ cho sản phẩm nằm trong danh sách chương trình, trong thời gian hiệu lực.
- **Miễn phí vận chuyển**: khi tổng tiền hàng (sau giảm) ≥ ngưỡng cấu hình (mặc định demo 5.000.000đ, sửa trong Admin → Khuyến mãi). Phí cố định 30.000đ.
- **Tạo đơn**: chỉ gửi `productId + quantity + thông tin nhận hàng`; giá/tổng tiền tính lại ở service.
- **Tồn kho**: trừ khi tạo đơn, hoàn lại khi đơn bị hủy (một lần duy nhất).
- **Trạng thái đơn**: Chờ xác nhận → Đã xác nhận → Đang chuẩn bị → Đang giao → Hoàn thành; hủy được trước khi hoàn thành. Khách chỉ tự hủy khi "Chờ xác nhận".
- **Thanh toán** tách riêng: COD mặc định "Chưa thanh toán", tự chuyển "Đã thanh toán" khi đơn hoàn thành.
- **Doanh thu** chỉ tính đơn hoàn thành.
- **Phân quyền**: mọi hàm Admin kiểm tra vai trò ADMIN (không chỉ ẩn nút).
