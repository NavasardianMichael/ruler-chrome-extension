import { useEffect } from 'react'
import { setStorageValue } from '_shared/functions/chromeStorage'

export const useSyncLocalStateToChromeStorage = (data: unknown) => {
  useEffect(() => {
    if (!data) return

    const sync = async () => {
      const prev = await chrome.storage.local.get()
      if (JSON.stringify(data) === JSON.stringify(prev)) return
      setStorageValue(data)
    }

    sync()
  }, [data])
}
