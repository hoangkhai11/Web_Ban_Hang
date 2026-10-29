import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'
interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastApi {
  success: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, type, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  const api: ToastApi = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  }

  const icon = { success: CheckCircle2, error: XCircle, info: Info }
  const color = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-sky-200 bg-sky-50 text-sky-800',
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed right-4 bottom-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = icon[t.type]
          return (
            <div key={t.id} className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${color[t.type]}`}>
              <Icon className="mt-0.5 size-4 shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button aria-label="Đóng" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>
                <X className="size-4 opacity-60" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast phải nằm trong ToastProvider')
  return ctx
}
