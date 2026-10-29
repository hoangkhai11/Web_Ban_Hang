import { OrderStatus } from '@prisma/client';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang chuẩn bị hàng',
  SHIPPING: 'Đang giao hàng',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

/** Các bước chuyển trạng thái hợp lệ (Admin Order Flow — LAB 4). */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};
