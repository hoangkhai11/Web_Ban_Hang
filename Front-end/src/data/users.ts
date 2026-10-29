import type { User } from '../types'

// Tài khoản thử nghiệm (chế độ demo FE). Ở Back-end mật khẩu sẽ được băm bằng bcrypt.
export interface SeedUser extends User {
  password: string
}

export const seedUsers: SeedUser[] = [
  {
    id: 1,
    fullName: 'Quản trị viên',
    email: 'admin@gicungco.vn',
    phone: '0900000000',
    address: 'Số 68 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội',
    role: 'ADMIN',
    createdAt: '2026-01-01T08:00:00.000Z',
    password: 'Admin@123',
  },
  {
    id: 2,
    fullName: 'Nguyễn Văn An',
    email: 'khachhang@gicungco.vn',
    phone: '0912345678',
    address: '12 Trần Duy Hưng, Phường Trung Hòa',
    role: 'CUSTOMER',
    createdAt: '2026-09-01T08:00:00.000Z',
    password: 'Khach@123',
  },
]
