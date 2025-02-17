import { useEffect } from 'react'
import { setStorageValue } from '_shared/functions/chromeStorage'

export const useSyncWithStorage = (data: unknown) => {
  useEffect(() => {
    if (!data) return
    setStorageValue(data)
  }, [data])
}
