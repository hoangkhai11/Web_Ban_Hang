import { useCallback, useEffect, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
  setData: (d: T) => void
}

/** Gọi một hàm bất đồng bộ (service/API) và quản lý trạng thái tải — lỗi. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    run()
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message || 'Đã có lỗi xảy ra'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [run, tick])

  return { data, loading, error, reload: () => setTick((t) => t + 1), setData }
}
