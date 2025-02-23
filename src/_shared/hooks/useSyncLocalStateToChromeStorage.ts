import { useCallback } from 'react'

import { setStorageValue } from '_shared/functions/chromeStorage'
import { State } from '_shared/types/state'

export const useSyncLocalStateToChromeStorage = () => {
  return useCallback(async (data: Partial<State>) => {
      const prev = await chrome.storage.local.get()
      const newState = {
        ...prev,
        ...data
      }
      if (JSON.stringify(newState) === JSON.stringify(prev)) return
      setStorageValue(newState)
  }, [])

}
