import { useEffect } from 'react'
import { setStorageValue } from '_shared/functions/chromeStorage'

export const useSyncLocalStateToChromeStorage = (data: unknown) => {
  useEffect(() => {
    if (!data) return

    const sync = async () => {
      const prev = await chrome.storage.local.get()
      const newState = {
        ...prev,
        ...data,
      }
      if (JSON.stringify(newState) === JSON.stringify(prev)) return
      setStorageValue(newState)
    }

    sync()
  }, [data])
}
