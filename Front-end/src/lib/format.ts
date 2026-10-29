export const formatVND = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(value)) + 'đ'

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const classNames = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ')
