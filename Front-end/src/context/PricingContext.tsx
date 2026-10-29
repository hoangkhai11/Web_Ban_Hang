import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getDiscountPercent, getFreeShippingPromotion, getUnitPrice } from '../lib/pricing'
import { getPricingContext } from '../services/promotionService'
import type { Product, Promotion, ShopSettings } from '../types'

/** Cung cấp chương trình khuyến mãi đang chạy để hiển thị giá giảm trên thẻ sản phẩm. */
interface PricingApi {
  promotions: Promotion[]
  settings: ShopSettings
  priceOf: (p: Product) => number
  discountOf: (p: Product) => number
  freeShippingThreshold: number | null
  reload: () => void
}

const PricingContext = createContext<PricingApi | null>(null)

export function PricingProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [settings, setSettings] = useState<ShopSettings>({ baseShippingFee: 0 })

  const reload = useCallback(() => {
    getPricingContext().then((r) => {
      setPromotions(r.promotions)
      setSettings(r.settings)
    })
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const api: PricingApi = {
    promotions,
    settings,
    priceOf: (p) => getUnitPrice(p, promotions),
    discountOf: (p) => getDiscountPercent(p, promotions),
    freeShippingThreshold: getFreeShippingPromotion(promotions)?.minOrderValue ?? null,
    reload,
  }
  return <PricingContext.Provider value={api}>{children}</PricingContext.Provider>
}

export function usePricing() {
  const ctx = useContext(PricingContext)
  if (!ctx) throw new Error('usePricing phải nằm trong PricingProvider')
  return ctx
}
