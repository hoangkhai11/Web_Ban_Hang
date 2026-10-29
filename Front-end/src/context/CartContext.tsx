import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CartLine } from '../types'

/**
 * Giỏ hàng lưu tạm ở trình duyệt (được phép theo yêu cầu dự án).
 * Đơn hàng chính thức luôn được xác thực lại ở server khi đặt hàng.
 */
const CART_KEY = 'gicungco_cart'
const MAX_QTY = 10

interface CartApi {
  lines: CartLine[]
  count: number
  add: (productId: number, quantity?: number) => void
  setQuantity: (productId: number, quantity: number) => void
  remove: (productId: number) => void
  clear: () => void
  // Sản phẩm được chọn để thanh toán (mặc định: tất cả)
  selected: number[]
  toggleSelected: (productId: number) => void
  setAllSelected: (on: boolean) => void
  // "Mua ngay": thanh toán riêng 1 sản phẩm
  buyNow: CartLine | null
  setBuyNow: (line: CartLine | null) => void
}

const CartContext = createContext<CartApi | null>(null)

const load = (): CartLine[] => {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartLine[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load)
  const [selected, setSelected] = useState<number[]>(() => load().map((l) => l.productId))
  const [buyNow, setBuyNow] = useState<CartLine | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lines))
    } catch {
      /* ignore */
    }
  }, [lines])

  const api: CartApi = {
    lines,
    count: lines.reduce((s, l) => s + l.quantity, 0),
    add: (productId, quantity = 1) => {
      setLines((ls) => {
        const found = ls.find((l) => l.productId === productId)
        if (found) return ls.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l))
        return [...ls, { productId, quantity: Math.min(MAX_QTY, quantity) }]
      })
      setSelected((s) => (s.includes(productId) ? s : [...s, productId]))
    },
    setQuantity: (productId, quantity) =>
      setLines((ls) => ls.map((l) => (l.productId === productId ? { ...l, quantity: Math.max(1, Math.min(MAX_QTY, quantity)) } : l))),
    remove: (productId) => {
      setLines((ls) => ls.filter((l) => l.productId !== productId))
      setSelected((s) => s.filter((id) => id !== productId))
    },
    clear: () => {
      setLines([])
      setSelected([])
    },
    selected,
    toggleSelected: (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
    setAllSelected: (on) => setSelected(on ? lines.map((l) => l.productId) : []),
    buyNow,
    setBuyNow,
  }

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart phải nằm trong CartProvider')
  return ctx
}

export const CART_MAX_QTY = MAX_QTY
